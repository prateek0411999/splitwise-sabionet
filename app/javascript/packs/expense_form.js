document.addEventListener('DOMContentLoaded', function() {
    $('.select-selectize').selectize();
    const expense_types =  document.getElementById("expense_expense_type");
    const itemized_div = document.getElementById("itemized");
    const non_itemized_div = document.getElementById("non_itemized");
    const split_types =  document.getElementById("expense_split_type");
    const payer = document.getElementById("expense_payer_id");
    const share_by_percentage_div =  document.getElementById("share_non_itemized_unequally");
    const expense_sharers =  document.getElementById("expense_sharer_ids");
    const totalAmountInput = document.getElementById('expense_total_amount');
    const expense_form = document.getElementById("expense-form");
    const itemContainer = $("#item-container");
    
    let itemCount = 0; // Counter for item inputs
    
    // Handlers
    expense_sharers.addEventListener('change', function() {
        // Enable total amount input only if at least one sharer is selected
        if(expense_types.selectedOptions[0].value == "itemized"){
            updateSelectOptions() 
        }else{
            totalAmountInput.disabled = expense_sharers.value.length === 0;

        }
    });

    split_types.addEventListener('change', function() {
        if (this.value === 'equally') {
            share_by_percentage_div.innerHTML = "";
            share_by_percentage_div.style.display = 'none';
        } else {
            share_by_percentage_div.innerHTML = "";
            share_by_percentage_div.style.display = 'block';
            // fetch selected sharers + payer_user
            let expense_sharers = fetchExpenseSharers();
            // map all the them and add the input where will specify the percentages
            createAndAppendPercentageField(expense_sharers);
        }
    });
    

    expense_types.addEventListener('change', function() {
        if(expense_types.selectedOptions[0].value == "non_itemized")
        {
            non_itemized_div.style.display = "block";
            itemized_div.style.display = "none";
        }else{
            non_itemized_div.style.display = "none";
            itemized_div.style.display = "block";
        }
       
    });
    
    $('#expense_sharer_ids').on("change", function() {
        updateSharersDropdown();
        if(expense_types.selectedOptions[0].value == "non_itemized"){
           if(expense_sharers.selectedOptions.length == 0)
           {
            totalAmountInput.disabled = true;
            split_types.value = "equally";
            split_types.dispatchEvent(new Event('change'));
           }
           else{
            totalAmountInput.removeAttribute("disabled")
            // selected Option
            let selected_split_type = split_types.selectedOptions[0].value;
            if(selected_split_type === "unequally"){
                //trigger change event
                split_types.dispatchEvent(new Event('change'));
            }
           }
        }else {
            document.getElementById("item-container").innerHTML= "";
            itemCount = 0;
            $("#total-value-container").hide()
        }
    })

    $("#expense_payer_id").on("change", function() {
        console.log('@!@@@@@@')
        updateSharersDropdown();
    })
 
    function fetchExpenseSharers()
    {
        let selectedValues = [];
        for (let option of expense_sharers.selectedOptions) {
            selectedValues.push({id: option.value, name: option.text});
        }
        let payer_selected = payer.selectedOptions[0]
        selectedValues.push({id: payer_selected.value, name: payer_selected.text})
    
        return selectedValues
    }
    
    function createAndAppendPercentageField(expense_sharers)
    {
        let container = share_by_percentage_div;
     // Iterate through the expense_sharers and create input fields
        expense_sharers.forEach(function(record) {
            // Create the input field
            var input = document.createElement('input');
            input.type = 'text';
            input.className = 'unequal_non_itemized_percentage'
            input.name = `expense[custom_sharer_expenses][${record.id}][percentage]`;
            input.placeholder = "x % of amount"
            input.required = true
            input.style = "margin-left: 10px;"
            input.value = ''; // You can set the initial value here if needed
            
            var label = document.createElement('label');
            label.textContent = record.name + ': ';
    
            container.appendChild(label);
            container.appendChild(input);
    
            container.appendChild(document.createElement('br'));
        });
    }
    
    function validateNonItemizedUnequallySplittedPercentage() {
        let sum = 0;    
        let errors = []
        // Validate each input value
        document.querySelectorAll('.unequal_non_itemized_percentage').forEach(function(input) {
            let value = input.value.trim();

            // Check if value is not empty and is a valid number
            if (value !== '' && isNaN(value)) {
                errors.push("Please enter a valid numeric value")
                input.value = ''; 
                return errors;
            }

            // Convert value to integer
            let intValue = parseInt(value);

            // Check if the value is a positive integer
            if (!Number.isInteger(intValue) || intValue < 0) {
                errors.push("Please enter a positive integer value")
                input.value = ''; 
                return errors; 
            }
            // Add the value to the sum
            sum += intValue;
        });

        // Check if the sum is not equal to 100
        if (sum !== 100) {
            errors.push("The sum of percentages should be 100")
            return errors;
        }
        return errors;
    }

    function updateSharersDropdown() {
        const selectedPayerId = $("#expense_payer_id").val();
        const selectedSharerIds = $("#expense_sharer_ids").val();
        

        console.log("selected payer", selectedPayerId)
        console.log("selected sharer ids ", selectedPayerId)
        // Remove the selected payer from the sharers dropdown
        $("#expense_sharer_ids").selectize();
        $("#expense_sharer_ids option").each(function() {
            const optionValue = $(this).val();
            if (optionValue === selectedPayerId) {
                $(this).prop("disabled", true).hide();
            } else {
                $(this).prop("disabled", false).show();
            }
        });
        
        // Remove the selected sharers from the payer dropdown
        $("#expense_payer_id option").each(function() {
            const optionValue = $(this).val();
            if (selectedSharerIds.includes(optionValue)) {
                $(this).prop("disabled", true).hide();
            } else {
                $(this).prop("disabled", false).show();
            }
        });
    }

    

    expense_form.addEventListener("submit", function(e) {
        e.preventDefault();
        // Perform custom validation
        let is_form_valid = validateForm()
        if (is_form_valid.valid) {
            // If form is valid, submit the form programmatically
            document.getElementById("expense-form").submit();
        }else{
            if(is_form_valid.errors)
            {
                Swal.fire({
                    title: "Error Occured",
                    text: `${is_form_valid.errors.join(", ")}`,
                    icon: "error"
                });
            }
        }
    })

    function validateForm() {
        // Use the checkValidity() method to trigger HTML5 form validation
        // This will check if all required fields are filled and meet other validation criteria
        let is_valid = {
            valid: true,
            errors: []
        };
        
        const form = document.getElementById("expense-form");
        let form_validity  = $('#expense-form')[0].checkValidity();
        if(!form_validity){ is_valid.valid = false; }
        if(split_types.selectedOptions[0].value == "unequally" && expense_types.selectedOptions[0].value == "non_itemized")
        {
            if(totalAmountInput.value <= 1 ) {is_valid.valid = false; is_valid.errors.push("Total Amount must be greater than or equal to 1")}
            let errors = validateNonItemizedUnequallySplittedPercentage()
            if (errors.length > 0){
                is_valid.valid = false;
                errors.forEach((e) => { is_valid.errors.push(e)})
            }
        }
        
        return is_valid;

    }








    function updateSelectOptions() {
        const selectedSharers = $("#expense_sharer_ids").html(); // Get updated options
        $(".sharer-select").html(selectedSharers); // Update options in all select tags
    }

    // Add event listener to add item button
    $("#add-item").click(function() {
    
        if ($("#expense_sharer_ids").val().length == 0) {
        // Display SweetAlert if no sharer is selected
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please select at least one sharer before adding an item!',
        });
        return; // Exit function if no sharer is selected
        }
        itemCount++; // Increment counter
        if(itemCount > 0)
        {
            document.getElementById("total-value-container").style.display = "block"
        }
        const htmlString = `
        <div class="card mb-3" style="margin-bottom: 15px;">
            <div class="card-body">
            <div class="row mb-3">
                <div class="col-md-4">
                <label for="item-description-label-${itemCount}" class="form-label">Item Description</label>
                <input type="text" class="form-control" id="item-description-input-${itemCount}" name="expense[custom_sharer_expenses][][${itemCount}][description]" placeholder="Enter item description" required>
                </div>
                <div class="col-md-3">
                <label for="item-amount-label-${itemCount}" class="form-label">Item Amount</label>
                <input type="number" class="form-control item-amount" id="item-amount-input-${itemCount}" name="expense[custom_sharer_expenses][][${itemCount}][amount]" placeholder="Enter item amount" step="0.01" required>
                </div>
                <div class="col-md-4">
                <div class="form-check ">
                    <div class="custom-sharer-columns">
                ${$("#expense_sharer_ids").find(":selected").map(function(index, element) {
                return `
                    <div><label for="sharer-share-${itemCount}-${element.value}" class="form-label" style="display: block;">${element.text}</label></div>
                    <input class="form-check-input expense-sharers-input expense-sharers-${itemCount}" type="text" id="sharer-share-${itemCount}-${element.value}" readonly>
                `;
                }).get().join("")}

                ${`
                    <div><label for="sharer-share-${itemCount}-${payer.selectedOptions[0].value}" class="form-label" style="display: block;">${payer.selectedOptions[0].text}</label></div>
                    <input class="form-check-input expense-sharers-input  expense-sharers-${itemCount}" type="text" id="sharer-share-${itemCount}-${payer.selectedOptions[0].value}" readonly>`
                }
                    </div>
                    <label for="item-split by ${itemCount}" class="form-label" style="display: block;">Split Item</label>
                    <input class="form-check-input split-checkbox" name="expense[custom_sharer_expenses][][${itemCount}][split_equally]" type="checkbox" id="split-equally-${itemCount}" checked>
                    <label class="form-check-label" for="split-equally-${itemCount}">Split Equally</label>
                    <select class="form-select sharer-select" name="expense[custom_sharer_expenses][][${itemCount}][sharer]" style="display: none;"></select>
                </div>  
                </div>
                <div class="col-md-1">
                <button type="button" class="btn btn-danger remove-item">Remove Item</button>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-12 ">
                <!-- Dynamic columns for sharers will be added here if splitting equally else just one amount for the selected sharer-->
                </div>
            </div>
            </div>
        </div>
        `;
        itemContainer.append(htmlString);
    });

    // Add event listener for removing item
    itemContainer.on("click", ".remove-item", function() {
        $(this).closest(".card").remove();
        itemCount--; // Decrement counter

        if(itemCount == 0)
        {
            $("#total-value-container").hide()
        }
    });

  // Add event listener to split checkbox
    itemContainer.on("change", ".split-checkbox", function() {
        const cardBody = $(this).closest(".card-body");
        const customsharerColumns = cardBody.find(".custom-sharer-columns");
        const payer = $("#expense_payer_id").find(":selected");
        const sharerSelect = cardBody.find(".sharer-select");
        if ($(this).is(":checked")) {
            sharerSelect.hide(); // Hide select tag
            customsharerColumns.append($("#expense_sharer_ids").find(":selected").map(function(index, element) {
                    return `
                        <div><label for="sharer-share-${itemCount}-${element.value}" class="form-label" style="display: block;">${element.text}</label></div>
                        <input class="form-check-input expense-sharers-input expense-sharers-${itemCount}" type="text" id="sharer-share-${itemCount}-${element.value}" readonly>
                    `;
                    }).get().join(""))
            
            customsharerColumns.append(`
                <div><label for="sharer-share-${itemCount}-${payer.val()}" class="form-label" style="display: block;">${payer.text()}</label></div>
                <input class="form-check-input expense-sharers-input expense-sharers-${itemCount}" type="text" id="sharer-share-${itemCount}-${payer.val()}" readonly>
            `)
            $(".item-amount").change();
        } else {
            customsharerColumns.empty();
            let selectedSharers = $("#expense_sharer_ids").html(); // Get selected sharers
            let option = `<option value=${payer.val()}> ${payer.text()} </option>`
            sharerSelect.html(selectedSharers); // Add options to select tag and show it
            sharerSelect.append(option)
            sharerSelect.show()
        }
    });

    itemContainer.on("change", ".item-amount", function() {
        const cardBody = $(this).closest(".card-body");
        const isSplitEqually = cardBody.find(".split-checkbox").is(":checked");
        const amount = parseFloat($(this).val()); // Get the new item amount
        const sharerInputs = cardBody.find(".expense-sharers-input");

        if (isSplitEqually) {
            // If split equally, update the value for each sharer input   
            let equalShare = amount / sharerInputs.length;
            let equalShareValue = equalShare.toFixed(2)
            
            if(isNaN(equalShareValue))
            {
                equalShareValue = ""
            }
            sharerInputs.each(function() {
                $(this).val(equalShareValue); // Update each sharer input with the equal share
            });
        }


        //update grand total 
        updateGrandTotal();
    })



    // update amount 
    function updateGrandTotal() {
        let subTotal = 0;
        // Iterate over each item
        $(".item-amount").each(function() {
            const amount = parseFloat($(this).val());
            subTotal += amount;
           
        });
        // Update the UI with the grand total
        let grandTotal = subTotal;
        subTotal = subTotal.toFixed(2);
        
        if(isNaN(subTotal))
        {
            grandTotalFloat = ""
        }else{
            grandTotalFloat = parseFloat(subTotal) + parseFloat((subTotal * 0.245))
        }
        $("#sub_total").val(subTotal);
        $("#grand_total").val(grandTotalFloat.toFixed(2));
    }
    
})