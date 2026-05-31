$(function () {
  $('#button').on('click', newItem);
  $('form[name="toDoList"]').on('submit', function (event) {
    event.preventDefault();
    newItem();
  });
  $('#list').sortable();
});

function newItem() {
  let input = $('#input');
  let inputValue = input.val().trim();

  if (inputValue === '') {
    alert('Please enter an item to add to the list.');
    return;
  }

  let li = $('<li></li>');
  let deleteButton = $('<button type="button" class="delete-button">X</button>');

  li.append(document.createTextNode(inputValue));
  li.append(deleteButton);
  $('#list').append(li);
  input.val('').focus();

  li.on('dblclick', function () {
    li.toggleClass('strike');
  });

  deleteButton.on('click', function () {
    li.remove();
  });
}
