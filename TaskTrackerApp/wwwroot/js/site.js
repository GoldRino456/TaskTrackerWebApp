const uri = 'https://localhost:7217/api/todoitems';
let todoListDisplay = [];

const createBtn = document.getElementById('createBtn');
createBtn.addEventListener('click', createRow);
let showCreateRow = false;

function getTodos() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayTodoData(data))
        .catch(error => console.error('Unable to get Todo list.', error));
}

function createRow() {
    if (showCreateRow) return;

    const tBody = document.getElementById('todoTableData');

    const tr = tBody.insertRow(0);
    tr.dataset.new = 'true';
    tr.dataset.editing = 'true';

    const td1 = tr.insertCell(0);
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.disabled = false;
    checkbox.checked = false;
    td1.appendChild(checkbox);

    const td2 = tr.insertCell(1);
    td2.innerHTML = `<input type="text" class="edit-title" value="">`;

    const td3 = tr.insertCell(2);
    td3.innerHTML = `<input type="text" class="edit-desc" value="">`;

    const td4 = tr.insertCell(3);
    td4.innerHTML = `<input type="date" class="edit-date" value="">`;

    const td5 = tr.insertCell(4);
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    td5.appendChild(saveBtn);

    const td6 = tr.insertCell(5);
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    td6.appendChild(cancelBtn);

    saveBtn.addEventListener('click', () => saveNewRow(tr));
    cancelBtn.addEventListener('click', () => cancelNewRow(tr));

    showCreateRow = true;
    createBtn.disabled = true;
}

async function saveNewRow(row) {
    const checkbox = row.querySelector('input[type="checkbox"]');
    const titleInput = row.querySelector('.edit-title');
    const descInput = row.querySelector('.edit-desc');
    const dateInput = row.querySelector('.edit-date');

    const newEntry = {
        isComplete: checkbox.checked,
        title: titleInput.value.trim(),
        description: descInput.value.trim(),
        dueDate: new Date(dateInput.value).toISOString()
    }

    //TODO: Insert Validation Here

    const resp = await fetch(`${uri}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEntry)
    })
        .catch(error => console.error('Unable to add item.', error));

    if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Server error ${resp.status}: ${txt}`);
    }

    const created = await resp.json();
    row.dataset.id = created.id;

    todoListDisplay.unshift(created);
    _displayTodoData(todoListDisplay);

    showCreateRow = false;
    createBtn.disabled = false;
}

function cancelNewRow(row) {
    row.remove();
    showCreateRow = false;
    createBtn.disabled = false;
}

function _displayTodoData(data) {
    const tBody = document.getElementById("todoTableData");
    tBody.innerHTML = '';

    const button = document.createElement('button');

    data.forEach((item, index) => {
        let isCompleteCheckbox = document.createElement('input');
        isCompleteCheckbox.type = 'checkbox';
        isCompleteCheckbox.disabled = true;
        isCompleteCheckbox.checked = item.isComplete;

        let editButton = button.cloneNode(false);
        editButton.innerHTML = 'Edit';
        editButton.className = 'edit-btn';

        let deleteButton = button.cloneNode(false);
        deleteButton.innerHTML = 'Delete';
        deleteButton.className = 'delete-btn';

        //**Build Table Row**
        let tr = tBody.insertRow();
        tr.dataset.id = item.id;

        tr.dataset.index = index;
        tr.dataset.editing = 'false';

        let td1 = tr.insertCell(0);
        td1.appendChild(isCompleteCheckbox);

        let td2 = tr.insertCell(1);
        td2.textContent = item.title ?? '';

        let td3 = tr.insertCell(2);
        td3.textContent = item.description ?? '';

        let td4 = tr.insertCell(3);
        td4.textContent = formatDateAsStr(item.dueDate) ?? '';

        let td5 = tr.insertCell(4);
        td5.appendChild(editButton);

        let td6 = tr.insertCell(5);
        td6.appendChild(deleteButton);

        //Listeners
        editButton.addEventListener('click', () => startEdit(tr));
        deleteButton.addEventListener('click', () => deleteRow(tr));
    });

    todoListDisplay = data;
}

function startEdit(row) {
    if (row.dataset.editing === 'true') return; //Do nothing if already in edit mode

    const idx = +row.dataset.index;
    const item = todoListDisplay[idx];

    //Store Original Data
    row.dataset.currentTitle = item.title ?? '';
    row.dataset.currentDesc = item.description ?? '';
    row.dataset.currentDueDate = item.dueDate ?? '';
    row.dataset.currentIsComplete = item.isComplete ? 'true' : 'false';

    //Build Editable Elements
    const tdCheckbox = row.cells[0];
    const tdTitle = row.cells[1];
    const tdDesc = row.cells[2];
    const tdDate = row.cells[3];
    const tdEditBtn = row.cells[4];
    const tdDeleteBtn = row.cells[5];

    const checkbox = tdCheckbox.querySelector('input[type="checkbox"]');
    checkbox.disabled = false;

    tdTitle.innerHTML = `<input type="text" class="edit-title" value="${escapeHtml(row.dataset.currentTitle)}">`;
    tdDesc.innerHTML = `<input type="text" class="edit-desc" value="${escapeHtml(row.dataset.currentDesc)}">`;
    tdDate.innerHTML = `<input type="date" class="edit-date" value="${formatDateAsStr(row.dataset.currentDueDate)}">`;

    //Replace Buttons
    tdEditBtn.innerHTML = '';
    tdDeleteBtn.innerHTML = '';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'save-btn';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'cancel-btn';

    tdEditBtn.appendChild(saveBtn);
    tdDeleteBtn.appendChild(cancelBtn);

    //Listeners
    saveBtn.addEventListener('click', () => saveEdit(row));
    cancelBtn.addEventListener('click', () => cancelEdit(row));

    row.dataset.editing = 'true';
}

function saveEdit(row) {
    const idx = +row.dataset.index;
    const tdCheckbox = row.cells[0];
    const tdTitle = row.cells[1];
    const tdDesc = row.cells[2];
    const tdDate = row.cells[3];

    const checkbox = tdCheckbox.querySelector('input[type="checkbox"]');
    const titleInput = tdTitle.querySelector('.edit-title');
    const descInput = tdDesc.querySelector('.edit-desc');
    const dateInput = tdDate.querySelector('.edit-date');

    const updatedEntry = {
        isComplete: checkbox.checked,
        title: titleInput.value.trim(),
        description: descInput.value.trim(),
        dueDate: new Date(dateInput.value).toISOString()
    }

    //TODO: Insert Validation Here

    //Update model
    todoListDisplay[idx] = {
        ...todoListDisplay[idx],
        ...updatedEntry
    }

    //Call API Here
    fetch(`${uri}/${row.dataset.id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEntry)
        })
        .catch(error => console.error('Unable to update item.', error));

    //Restore UI to non-editable
    restoreRowUI(row, todoListDisplay[idx]);
    row.dataset.editing = 'false';
}

function cancelEdit(row) {
    const originalEntry = {
        isComplete: row.dataset.currentIsComplete === 'true',
        title: row.dataset.currentTitle,
        description: row.dataset.currentDesc,
        dueDate: row.dataset.currentDueDate
    };

    restoreRowUI(row, originalEntry);

    row.dataset.editing = 'false';
}

function restoreRowUI(row, item) {

    const tdCheckbox = row.cells[0];
    const tdTitle = row.cells[1];
    const tdDesc = row.cells[2];
    const tdDate = row.cells[3];
    const tdEditBtn = row.cells[4];
    const tdDeleteBtn = row.cells[5];

    const checkbox = tdCheckbox.querySelector('input[type="checkbox"]');
    checkbox.checked = !!item.isComplete;
    checkbox.disabled = true;

    tdTitle.textContent = item.title ?? '';
    tdDesc.textContent = item.description ?? '';
    tdDate.textContent = formatDateAsStr(item.dueDate) ?? '';

    tdEditBtn.innerHTML = '';
    tdDeleteBtn.innerHTML = '';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.addEventListener('click', () => startEdit(row));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteRow(row));

    tdEditBtn.appendChild(editBtn);
    tdDeleteBtn.appendChild(deleteBtn);
}

async function deleteRow(row) {
    const confirmDelete = await displayConfirmModal({
        title: 'Delete Task?',
        message: 'Are you sure you wish to delete this task? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
    });

    if (!confirmDelete) {
        console.log('User cancelled.');
        return;
    }


    const idx = +row.dataset.index;
    const item = todoListDisplay[idx];

    try {
        const response = await fetch(`${uri}/${row.dataset.id}`, { method: 'DELETE' });

        if (response.status === 204) {
            displayToastMessage(`Task successfully deleted.`, { type: 'success' });
        }
        else {
            displayToastMessage(`Could not delete task.`, { type: 'error' });
        }

        await getTodos(); 
    }
    catch (error) {
        displayToastMessage(`Could not delete item from Database: ${error}`, { type: 'error' });
    }
}

function escapeHtml(str) {
    if (!str) return '';

    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatDateAsStr(dateStr) {
    if (!dateStr) return '';

    const d = new Date(dateStr);

    if (isNaN(d)) return '';

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${da}`;
}

function displayToastMessage(message, options = {}) {
    //options: type ('success'|'error'|'info'|'warning'), autohide (bool), delay (ms)

    const type = options.type || 'info';
    const autohide = options.autohide !== undefined ? options.autohide : true;
    const delay = options.delay || 3000;

    const container = document.getElementById('toastContainer');
    if (!container) {
        console.warn('No toast container found on page (id="toastContainer"). Toast was not displayed!');
        return;
    }

    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-bg-${type === 'error' ? 'danger' : (type === 'info' ? 'info' : (type === 'warning' ? 'warning' : 'success'))} border-0`;
    toastElement.setAttribute('role', 'status');
    toastElement.setAttribute('aria-live', 'polite');
    toastElement.setAttribute('aria-atomic', 'true');

    toastElement.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escapeHtml(message)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;

    container.appendChild(toastElement);

    const toast = bootstrap.Toast.getOrCreateInstance(toastElement, {
        autohide: autohide,
        delay: delay
    });

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });

    toast.show();
}

function displayConfirmModal({ title = 'Confirm', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', size = '' } = {}) {
    return new Promise((resolve) => {
        const modalElement = document.getElementById('confirmModal');
        const modalLabel = modalElement.querySelector('#confirmModalLabel');
        const modalBody = modalElement.querySelector('#confirmModalBody');
        const modalConfirmBtn = modalElement.querySelector('#confirmModalConfirm');
        const modalCancelBtn = modalElement.querySelector('#confirmModalCancel');

        modalLabel.textContent = title;
        modalBody.textContent = message;
        modalConfirmBtn.textContent = confirmText;
        modalCancelBtn.textContent = cancelText;

        const dialog = modalElement.querySelector('.modal-dialog');
        dialog.classList.remove('modal-sm', 'modal-lg', 'modal-xl');
        if (size === 'sm') dialog.classList.add('modal-sm');
        if (size === 'lg') dialog.classList.add('modal-lg');
        if (size === 'xl') dialog.classList.add('modal-xl');

        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: true
        });

        const cleanup = (result) => {
            modalConfirmBtn.removeEventListener('click', onConfirm);
            modalCancelBtn.removeEventListener('click', onCancel);
            modalElement.removeEventListener('hidden.bs.modal', onHidden);
            resolve(result);
            try { bsModal.hide(); } catch (e) { }
        };

        const onConfirm = (ev) => { ev.preventDefault(); cleanup(true); };
        const onCancel = (ev) => { ev.preventDefault(); cleanup(false); };

        const onHidden = (ev) => { cleanup(false); };

        modalConfirmBtn.addEventListener('click', onConfirm);
        modalCancelBtn.addEventListener('click', onCancel);
        modalElement.addEventListener('hidden.bs.modal', onHidden, { once: true });

        bsModal.show();

        modalCancelBtn.focus();
    });
}