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
    
    // Handlers
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
    
    expense_sharers.addEventListener('change', function() {
        // Enable total amount input only if at least one sharer is selected
        totalAmountInput.disabled = expense_sharers.value.length === 0;
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
           if(expense_sharers.selectedOptions.length == 0)
           {
            totalAmountInput.disabled = true;
            split_types.value = "equally";
            split_types.dispatchEvent(new Event('change'));
           }else{
            totalAmountInput.removeAttribute("disabled")
            // selected Option
            let selected_split_type = split_types.selectedOptions[0].value;
            if(selected_split_type === "unequally"){
                //trigger change event
                split_types.dispatchEvent(new Event('change'));
            }
           }
        }
    )

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

    
})