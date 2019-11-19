// eslint-disable-next-line max-lines-per-function
$(() => {
  const $tasksList = $('#tasks-list');
  const $taskInput = $('#task-input');
  const $notification = $('#notification');
  const $taskAddition = $('#task-addition');
  const $globalCheckBox = $('#global-check-box');
  const $removeCompletedTasks = $('#remove-completed-tasks');
  const $counterComplete = $('#counter-complete');
  const $counterInProgress = $('#counter-in-progress');
  const $completedTasks = $('#completed-tasks');
  const $allTasks = $('#all-tasks');
  const $tasksInProgress = $('#tasks-in-progress');
  const $paginationBlock = $('#pagination-block');
  const $hidingObject = $('.hiding-object');
  const $tab = $('.tab');

  const TASKS_LIMIT = 5;
  const ENTER_KEY = 13;

  let todoList = [];
  let $navigationTrigger = $allTasks;
  let actualPageNumber = 1;

  const divideWithCeil = arr => Math.ceil(arr.length / TASKS_LIMIT);


  const pageCount = arr => {
    const newArr = Array.from(Array(divideWithCeil(arr)).keys());

    return newArr;
  };

  const correctPageNumber = (arr, pageNumber) => {
    const newPageNumber = pageNumber > divideWithCeil(arr)
      ? divideWithCeil(arr)
      : pageNumber;

    return newPageNumber;
  };

  const pageRender = arr => {
    let pageNumberButtons = ``;

    const newArr = pageCount(arr);
    const pageNumber = correctPageNumber(arr, actualPageNumber);

    newArr.forEach(item => {
      const pageNavigation = item + 1 === pageNumber;

      pageNumberButtons += `<button class='btn 
            ${pageNavigation && 'hint'}
             page-button' id='${item + 1}'>${Number(item) + 1}</button>`;
    });
    $paginationBlock.html(pageNumberButtons);
  };

  const selectCompletedTasks = arr => {
    const newArr = arr.filter(item => item.status === true);

    return newArr;
  };

  const selectTasksInProgress = arr => {
    const newArr = arr.filter(item => item.status === false);

    return newArr;
  };

  const navigateTab = $navigation => {
    $tab.removeClass('hint');
    $navigation.addClass('hint');
  };

  const displayNotification = () => {
    if (todoList.length) {
      const { length: numberCompleted } = selectCompletedTasks(todoList);
      const numberInProgress = todoList.length - numberCompleted;

      $hidingObject.removeClass('hide');
      $notification.addClass('hide');
      $counterComplete.text(`${numberCompleted} tasks complete`);
      $counterInProgress.text(`${numberInProgress} tasks in progress`);
    } else {
      $hidingObject.addClass('hide');
      $notification.removeClass('hide');
      $taskInput.val(``);
    }
  };

  const globalCheckBoxStateSwitch = () => {
    const newArr = selectCompletedTasks(todoList);

    const checking = Boolean(todoList.length
       && todoList.length === newArr.length);

    $globalCheckBox.prop('checked', checking);
  };

  const protectFromScript = originalInputValue => {
    let newInputValue = String(originalInputValue);

    newInputValue = newInputValue.replace(/&/u, '&amp;')
      .replace(/</gu, '&lt;')
      .replace(/>/gu, '&gt;')
      .replace(/"/gu, '&quot;')
      .replace(/'/gu, '&apos;')
      .replace(/\//gu, '&frasl;')
      .replace(/\$/gu, '&#36;')
      .replace(/\[/gu, '&#91;')
      .replace(/\]/gu, '&#93;')
      .replace(/\{/gu, '&#123;')
      .replace(/\}/gu, '&#125;')
      .replace(/ {1,}/gu, ' ')
      .trim(newInputValue);

    return newInputValue;
  };

  const selectRenderingTasks = arr => {
    const pageNumber = correctPageNumber(arr, actualPageNumber);
    const newArr = arr.filter((item, index) => index
    >= (pageNumber - 1) * TASKS_LIMIT
      && index < pageNumber * TASKS_LIMIT);

    return newArr;
  };

  const render = arr => {
    pageRender(arr);

    let listFilling = ``;

    selectRenderingTasks(arr).forEach(item => {
      listFilling += `<li class='row' id=${item.id}>
      <input type='checkbox' class='custom-checkbox-1 col-auto' id='check-box' 
      ${item.status && 'checked'}>
            <span ${item.status === true ? 'style="opacity: 0.4"' : ''}
            class='col-md-8' id='todo-text'>${item.text}</span>
            <button class='btn col-auto' id='delete-button'>&#10006</button>
            </li>`;
    });

    $tasksList.html(listFilling);
    displayNotification();
  };

  const renderThisTab = arr => {
    switch ($navigationTrigger) {
      case $completedTasks:
        render(selectCompletedTasks(arr));
        break;
      case $tasksInProgress:
        render(selectTasksInProgress(arr));
        break;
      default:
        render(arr);
    }
  };

  const showLatestTask = arr => {
    actualPageNumber = divideWithCeil(arr);

    return actualPageNumber;
  };

  const correctAdditionNewTask = () => {
    $navigationTrigger = $navigationTrigger === $tasksInProgress
      ? $allTasks
      : $navigationTrigger;
    $navigationTrigger = $navigationTrigger === $completedTasks
      ? $allTasks
      : $navigationTrigger;
  };

  const renderWithSwitch = () => {
    globalCheckBoxStateSwitch();
    renderThisTab(todoList);
  };

  const addNewTask = () => {
    correctAdditionNewTask();
    navigateTab($navigationTrigger);
    let newTask = $taskInput.val();

    newTask = protectFromScript(newTask);
    if (newTask) {
      const todoTask = {
        id: Math.random(),
        status: false,
        text: newTask,
      };

      todoList.push(todoTask);
      showLatestTask(todoList);
      renderWithSwitch();
      $taskInput.val(``);
    }
  };

  $taskAddition.on('click', () => {
    addNewTask();
  });

  $taskInput.on('keypress', event => {
    if (event.which === ENTER_KEY) {
      addNewTask();
    }
  });

  $paginationBlock.on('click', '.page-button', function() {
    actualPageNumber = Number($(this).attr('id'));
    renderThisTab(todoList);
  });

  const switchFirstPage = $actualTab => {
    actualPageNumber = 1;
    $navigationTrigger = $actualTab;
    renderThisTab(todoList);
    navigateTab($navigationTrigger);
  };

  $allTasks.on('click', () => {
    switchFirstPage($allTasks);
  });

  $completedTasks.on('click', () => {
    switchFirstPage($completedTasks);
  });

  $tasksInProgress.on('click', () => {
    switchFirstPage($tasksInProgress);
  });

  const deleteThisTask = actualIndex => {
    todoList.forEach((item, index) => {
      if (item.id === Number(actualIndex)) {
        todoList.splice(index, 1);
      }
    });
  };

  $tasksList.on('click', '#delete-button', function() {
    const actualId = $(this).parent()
      .attr('id');

    deleteThisTask(actualId);
    renderWithSwitch();
  });

  const checkThisTask = (actualIndex, checkState) => {
    todoList.forEach(item => {
      if (item.id === Number(actualIndex)) {
        item.status = checkState;
      }
    });
  };

  $tasksList.on('change', '#check-box', function() {
    const actualId = $(this).parent()
      .attr('id');
    const checkBoxState = $(this).prop('checked');

    checkThisTask(actualId, checkBoxState);
    renderWithSwitch();
  });

  const checkAllTasks = () => {
    if ($globalCheckBox.prop('checked')) {
      todoList.forEach(item => {
        item.status = true;
      });
    } else {
      todoList.forEach(item => {
        item.status = false;
      });
    }
  };

  $globalCheckBox.on('change', () => {
    checkAllTasks();
    renderThisTab(todoList);
  });

  const deleteAllCompletedTasks = () => {
    const newArr = todoList.filter(item => item.status === false);

    return newArr;
  };

  $removeCompletedTasks.on('click', () => {
    todoList = deleteAllCompletedTasks();
    renderWithSwitch();
  });

  $tasksList.on('dblclick', '#todo-text', function() {
    $(this).replaceWith(`<input type='text' class='form-control col-md-8' 
    id='edit-form-id' value='${$(this).text()}'></input>`);
    $('#edit-form-id').focus();
  });

  $(document).on('blur', '#edit-form-id', () => {
    renderThisTab(todoList);

    $taskInput.focus();
  });

  const editThisTask = function(actualIndex) {
    let $editingTask = $('#edit-form-id').val();

    $editingTask = protectFromScript($editingTask);
    if ($editingTask) {
      todoList.forEach(item => {
        if (item.id === Number(actualIndex)) {
          item.text = $editingTask;
        }
      });
    }
  };

  $tasksList.on('keypress', '#edit-form-id', function(event) {
    if (event.which === ENTER_KEY) {
      const actualId = $(this).parent()
        .attr('id');

      editThisTask(actualId);
      renderThisTab(todoList);
    }
  });
});
