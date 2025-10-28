const uri = 'https://localhost:7217/api/todoitems';
let todoListDisplay = [];

function getTodos() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayTodoData(data))
        .catch(error => console.error('Unable to get Todo list.', error));
}

function _displayTodoData(data) {
    const tBody = document.getElementById("todoTableData");
    tBody.innerHTML = '';

    const button = document.createElement('button');

    data.forEach(item => {
        //**Create additional elements**
        let isCompleteCheckbox = document.createElement('input');
        isCompleteCheckbox.type = 'checkbox';
        isCompleteCheckbox.disabled = true;
        isCompleteCheckbox.checked = item.isComplete;

        let editButton = button.cloneNode(false);
        editButton.innerHTML = 'Edit';
        //editButton.setAttribute(); <- Set onClick action here.

        let deleteButton = button.cloneNode(false);
        deleteButton.innerHTML = 'Delete';
        // Same as edit above.

        //**Build Table Row**
        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        td1.appendChild(isCompleteCheckbox);

        let td2 = tr.insertCell(1);
        let titleTextNode = document.createTextNode(item.title);
        td2.appendChild(titleTextNode);

        let td3 = tr.insertCell(2);
        let descTextNode = document.createTextNode(item.description);
        td3.appendChild(descTextNode);

        let td4 = tr.insertCell(3);
        let dateTextNode = document.createTextNode(item.dueDate);
        td4.appendChild(dateTextNode);

        let td5 = tr.insertCell(4);
        td5.appendChild(editButton);

        let td6 = tr.insertCell(5);
        td6.appendChild(deleteButton);
    });

    todoListDisplay = data;
}