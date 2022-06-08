//Add new item to the list
function newItem() {
    let li = $('<li></li>');
    let inputValue = $('#input').val();
    li.append(inputValue);

    if (inputValue === '') {
        alert("Please enter an item to add to the list.");
    } else {
        $('#list').append(li);
    }

    //Crossing out tasks by double click
    function crossOut() {
      li.toggleClass("strike");
    }
    li.on("dblclick", crossOut);

    //Adding a delete button for the cross out function
    let crossOutButton = $("<crossOutButton></crossOutButton>");
    crossOutButton.append(document.createTextNode("X"));
    li.append(crossOutButton);
    crossOutButton.on("click", deleteListItem);

    function deleteListItem() {
        li.addClass("delete");
    }

    //Making the list sortable
    $('#list').sortable();
}
