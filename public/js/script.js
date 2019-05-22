$(document).ready(() => {
  
    // auto selects animal_input on load
    $("#animal_input").select();

    // <div id="animalSelector">
    //     <ul id="myUL">
    //         <li><a href="#">Dog</a></li>
    //         <li><a href="#">Cat</a></li>
    //         <li><a href="#">Rabbit</a></li>
    //         <li><a href="#">Monkey</a></li>
    //         <li><a href="#">Unicorn</a></li>
    //         <li><a href="#">Hamster</a></li>
    //         <li><a href="#">Bird</a></li>
    //         <li><a href="#">Horse</a></li>
    //     </ul>
    // </div>

    let animal_list = $("#animalSelector #myUL li a"); 
    animal_list.click(element => {
        let value = element.currentTarget.innerHTML; 
        animal_list.attr('href', `upload/${value.toLowerCase()}`);

    });


}); 