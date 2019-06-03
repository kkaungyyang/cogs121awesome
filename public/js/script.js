// Bind event listeners once DOM is loaded
$(document).ready(() => {

    // Initially hides all sections besides step 1
    $('.init-hide').hide();
    
    /* STEP 0 ELEMENTS */

    // Look up info chosen (FUNCTION 1)
    $('#step0 span#lookUpInfo').click(() => {
        $("#lookup").fadeIn("slow", () => {});
        
        // Slow scroll from step 0 to step 1
        $('html, body').animate({
            scrollTop: $('#lookup').offset().top - 100
        }, 'slow');

        $("div#step0 div#chooseAction div.col-6 span#identifyAnimal").parent().fadeOut("slow", () => {}); 
    });

    // Identify animal chosen (FUNCTION 2)
    $('#step0 span#identifyAnimal').click(() => {
        $("#step1").fadeIn("slow", () => {});
        
        // Slow scroll from step 0 to step 1
        $('html, body').animate({
            scrollTop: $('#step1').offset().top - 100
        }, 'slow');

        $("div#step0 div#chooseAction div.col-6 span#lookUpInfo").parent().fadeOut("slow", () => {}); 
    });


    /* STEP 1 ELEMENTS */
    
    // Allow file selection through by clicking on the upload image preview/icon
    $('#upload_image').click( ()=> {
        $('button.uploadcare--widget__button.uploadcare--widget__button_type_open').trigger('click');
    });	
    
    // Does not change preview when you cancel out of choosing a photo
    $('#upload_input').on('click touchstart', function () {
        $(this).val('');
    });	

    // When a new photo is uploaded, change preview
    const widget = uploadcare.Widget('[role=uploadcare-uploader]');
    widget.onUploadComplete((info) => {
        $('#upload_image').attr('src', info.cdnUrl);
        $('#view_results').show();
    })	

    // Slow scroll from step1 to step2
    $('#step1 .scroll').click(() => {
        $('html, body').animate({ scrollTop: $('#step2').offset().top} - 100, 'slow');
    });


    /* STEP 2 ELEMENTS */

    // When 'Click to learn more' button is clicked, show tables/cards of details by breed
    $('#expand_details').click(()=>{

        // Show all tables of breed details
        $("#breed_tables").fadeIn("slow", () => {});
        // Hide the 'click to learn more' button
        $('#expand_details').hide();

        // Slow scroll to cards
        $('html, body').animate({
            scrollTop: $( '#breed_tables' ).offset().top - 100
        }, 'slow');

    });	

    // Slow scroll from step 2 to top
    $('#step2 .scroll').click(() => {
        setTimeout(() => {
            // After slow scroll to top of page (after timeout), reload page to allow user to start again
            location.reload();
        }, 300);
        $('html, body').animate({ scrollTop: 0 }, 'slow');
    });


}); // End of DOM.ready


/* FUNCTION 1 - Search Bar
 * Filter through animal button selectors from input
 */
function filterBreeds() {
    let input, filter, breeds, breedName;
    input = document.getElementById("breed_input");
    filter = input.value.toUpperCase();
    breeds = document.querySelectorAll(".dog_card button");
    infoCards = document.querySelectorAll(".dog_card");
    breeds.forEach((element, index) => {
        breedName = element.innerText;
        if (breedName.toUpperCase().indexOf(filter) > -1) {
            // infoCards[index].class = "d-none";
            infoCards[index].style.display = "";
        } else {
            // infoCards[index].class = "d-none";
            infoCards[index].style.display = "none";
        }
    });
}


/* FUNCTION 2 - Step 2
 * Uploads photo and parses information
 * AJAX call to fetch breed results, appends flip-cards to DOM with data
 */
function fetchResults() {

    // Hide submit buttons, show loading animation 
    $('#upload_buttons').hide();
    $('#process_text').show();
    
    // Get URL from uploadcare
    const imageUrl = $('#upload_input').attr('value');

    // Holds values for breed results
    const breedBreakdown = {};   // {key: breed, val: %}
    let breedPercents = []; 	 // [['breedName','percent'],...] 

    // Ajax call, send dog photo URL through GET request to get breakdown of breed-percentages
    $.get( '/mlapi', {imageUrl: imageUrl}, 'json')
    .always( ()=>{
        console.log("Done sending URL and requesting ML results.");
    })
    .fail(function(xhr, status, error){
        // If failed, reset loading animation to upload buttons so user can re-submit
        $('#upload_buttons').show();
        $('#process_text').hide();
        alert("Error uploading photo to server, please try again.");
        console.log("AJAX Request Error: " + JSON.stringify(xhr));
    })
    .done(function(data) {
        // Add up total percentages returned
        let total = 0;
        JSON.parse(data).forEach(breedStat => {
            total += parseFloat(breedStat.split('%\t')[0]);
        });

        // Parse result of ML for chart visualization
        JSON.parse(data).forEach(breedStat => {
            const info = breedStat.split('%\t');
            const percent = (parseFloat(info[0]) * 100 / total).toFixed(2); 

            // Align names with format of dog breed api
            let breedName = info[1].toLowerCase().replace(/ /g,"").replace(/_/g," ");
            breedName = breedName.replace("bullterrier", "bull terrier");
            breedName = breedName.replace("leonberg", "leonberger");
            breedName = breedName.replace("pekinese", "pekingese");

            // Capitalize first letter of each word
            breedName = breedName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            breedPercents.push([breedName, percent]);
            breedBreakdown[ breedName ] = percent;
        });
        console.log("Done 1: ML results parsed");
    })
    .done(function(data) {
        // Generate chart to visualize breeds
        c3.generate({
            bindto: '#breed_chart',
            data: {
                // iris data from R
                columns: breedPercents,
                type: 'pie',
                onclick: function (breed, percent) {
                    // console.log(breed);
                    flipCard(breed.name);
                }
            }
        });
        console.log("Done 2: Chart generated");
    })
    .done(function(data) {
        // For each identified breed, fetch breed details from db
        Object.keys(breedBreakdown).forEach( (b)=>{ 
            // Dynamically add tables to html with helper function 
            fetchBreedDetails(b); 
        });
        console.log("Done 3: Tables created");
    })
    .done( ()=>{
        // Finished data fetching; change loading animation and display results
        $('#process_text').hide(); //loading text
        $('#loaded_text').show();
        $('#step2').show();
        
        // Slow scroll from step1 to step2 after data fetch is complete
        setTimeout( ()=>{
            $('html, body').animate({
                scrollTop: $( '#step2' ).offset().top - 100
            }, 'slow');
        },500);
        
        console.log("Done 4: Data loaded; show step 3");
    });
    

    // Helper function to fetch details from db per breed name
    // Each breed has its own card with details, which is appended to #breed_tables only once-through.
    function fetchBreedDetails(breedName){
        $.ajax({
            url: '/fetch',
            type: 'GET',
            data: { breed: breedName},
            dataType: 'json',
            beforeSend: ()=>{
                console.log("Breed requested is: ", breedName);
            },
            success: function (data) {
                console.log(breedName, " exists in DogAPI db");
                
                // Grabs response data as json
                const info_json = data;
                const info_keys = Object.keys(info_json);

                // Add new card for current breed with it's breed name as id
                const breed_id = breedName.toLowerCase().replace(/ /g,"_");	
                $('#breed_tables').append($('<flip-card id="'+breed_id+'" class="col-lg-4 col-md-6 col-sm-12"></flip-card>'));

                const card = document.querySelector("flip-card:last-child").shadowRoot;

                // Fill in dynamic fields like breed name, percentage, percentage
                card.querySelectorAll(".card_breed").forEach( (elem)=> {
                    elem.innerHTML = breedName;
                });
                card.querySelector("#card_percent").innerHTML = breedBreakdown[breedName]+"%";
                card.querySelector("progress").value = breedBreakdown[breedName];

                // Create document fragment to append details to for better performance
                const fragment = document.createDocumentFragment();
                        
                // Appends details dynamically (breed details in table format)
                info_keys.forEach(prop => {
                    const tr = document.createElement('tr');
                    const td1 = document.createElement('td');
                    td1.appendChild( document.createTextNode( prop.replace("_", " ") ) );
                    const td2 = document.createElement('td');

                    if (prop == 'image'){ // Change background to dog image
                        card.querySelector(".front").style.backgroundImage = "url('" + info_json[prop] +"')";
                    }
                    else { // Otherwise append info
                        td2.appendChild( document.createTextNode(info_json[prop]) );
                        tr.appendChild(td1);
                        tr.appendChild(td2);
                        fragment.appendChild(tr);
                    } 
                });
                card.querySelector("#card_table").appendChild(fragment);
                
                // Add attribute to see whether card is front or back facing
                card.querySelector("input[type='checkbox'].more").setAttribute('data-dir', 'front');

                // Attach event listener to button on card (which flips the card)
                card.querySelector("input[type='checkbox'].more").addEventListener( 'click', (e)=>{
                    const target = e.currentTarget;
                    if (target.getAttribute('data-dir') == 'front'){
                        target.setAttribute('data-dir', 'back');
                    }else{
                        target.setAttribute('data-dir', 'front');
                    }
                });
            },
            error: function (request, error) {
                // console.log("AJAX Request Error: " + JSON.stringify(request));
                // No information in DB on the given dog breed
                console.log(breedName, " does not exist in DogAPI db");
            }
        });

    } // end of fetchBreedDetails helper function



    // Helper function called every time pie chart slice is clicked, flips the chosen card
    function flipCard(breed) {
        // Hides error information incase it was displayed
        $("#card_error").hide();
        // Shows cards if not yet displayed
        $("#expand_details" ).trigger( "click" );

        // Grabs breed id in format: #breed_name
        const breed_id = "#"+breed.toLowerCase().replace(/ /g,"_");

        // If breed exists in db, flip that card, otherwise show error message
        if ($(breed_id).length > 0) { // EXISTS
    
            // Front face all other cards first
            document.querySelectorAll("flip-card").forEach( (e)=>{
                const btn = e.shadowRoot.querySelector("input[type='checkbox'].more");
                if (btn.getAttribute('data-dir') == 'back'){
                    btn.click();
                }
            });

            // Send view to that breed's card
            $('html, body').animate({
                scrollTop: $(breed_id).offset().top - 100
            }, 'slow');

            // Flip the card
            const btn = document.querySelector("flip-card"+breed_id).shadowRoot.querySelector("input[type='checkbox'].more");
            btn.click();

        } else { // DOESN'T EXIST
        
            // Show and scroll to the error message
            $("#card_error").show();
            
            $('html, body').animate({
                scrollTop: $("#card_error").offset().top -100
            }, 'slow');
            
        }

    }

} //end of fetchResults 



// Custom web-component for displaying breed info
customElements.define('flip-card', class extends HTMLElement {
    constructor() {
        super(); // always call super() first in the constructor.

        // Attach a shadow root to the element.
        let shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(document.getElementById("table_tmpl").content.cloneNode(true));
    }
});
