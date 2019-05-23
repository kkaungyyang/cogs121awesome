$(document).ready(() => {
  
    // auto selects animal_input on load
    $("#animal_input").select();

    let animal_list = $("#animalSelector #myUL li"); 
    animal_list.click(element => {
        let value = element.currentTarget.innerHTML;
        animal_list.attr('href', `#upload`);
    });


}); 