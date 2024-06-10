document.addEventListener('DOMContentLoaded', function () {
  loadTasks();

  document.getElementById('taskInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      addTask();
    }
  });
});

function loadTasks() {
  chrome.storage.sync.get('tasks', function (data) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (data.tasks) {
      const sortedTasks = data.tasks.sort((a, b) => {
        const aChecked = isChecked(a);
        const bChecked = isChecked(b);
        return aChecked === bChecked ? 0 : aChecked ? 1 : -1;
      });

      sortedTasks.forEach(function (task) {
        addTaskToList(task);
      });
    }
  });
}

function isChecked(task) {
  return task.includes('&check;');
}

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const taskText = taskInput.value.trim();

  if (taskText === '') {
    return;
  }

  chrome.storage.sync.get('tasks', function (data) {
    const tasks = data.tasks || [];

    tasks.push(taskText);

    chrome.storage.sync.set({ 'tasks': tasks }, function () {
      taskInput.value = '';

      loadTasks();
    });
  });

}

function addTaskToList(taskText) {
  const taskList = document.getElementById('taskList');
  const listItem = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = isChecked(taskText);

  checkbox.addEventListener('change', function () {
    checkbox.checked = !isChecked(taskText);
    taskTextSpan.style.textDecoration = checkbox.checked ? "line-through" : "none";
    updateTaskStatus(taskText, !isChecked(taskText));
  });

  const taskTextSpan = document.createElement('p');
  taskTextSpan.innerHTML = taskText;
  taskTextSpan.classList.add('taskText');
  taskTextSpan.style.textDecoration = checkbox.checked ? "line-through" : "none";

  const deleteButton = document.createElement('p');
  deleteButton.textContent = 'Remove';
  deleteButton.classList.add('removeButton');

  deleteButton.addEventListener('click', function () {
    deleteTask(taskText);
  });

  listItem.appendChild(checkbox);
  listItem.appendChild(taskTextSpan);
  listItem.appendChild(deleteButton);

  taskList.appendChild(listItem);
}

function deleteTask(taskText) {
  chrome.storage.sync.get('tasks', function (data) {
    const tasks = data.tasks || [];

    const updatedTasks = tasks.filter(task => task !== taskText);

    chrome.storage.sync.set({ 'tasks': updatedTasks }, function () {
      loadTasks();
    });
  });
}

function updateTaskStatus(taskText, checked) {
  chrome.storage.sync.get('tasks', function (data) {
    const tasks = data.tasks || [];

    const updatedTasks = tasks.map(task => {
      if (task === taskText) {
        return checked ? `${task} &check;` : task.replace(' &check;', '');
      }
      return task;
    });

    chrome.storage.sync.set({ 'tasks': updatedTasks }, function () {
      loadTasks();
    });
  });
}