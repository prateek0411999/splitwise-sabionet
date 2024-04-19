document.addEventListener('DOMContentLoaded', function() {
    $('.select-selectize').selectize();
    const split_types =  document.getElementById("expense_split_type");
    const payer = document.getElementById("expense_payer_id")
    const share_by_percentage_div =  document.getElementById("share_non_itemized_unequally");
    const expense_sharers =  document.getElementById("expense_sharer_ids");
    const totalAmountInput = document.getElementById('expense_total_amount');
    
    // Handlers
    split_types.addEventListener('change', function() {
        if (this.value === 'equally') {
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
    
    
    function fetchExpenseSharers()
    {
        let selectedValues = [];
        for (let option of expense_sharers.selectedOptions) {
            selectedValues.push({id: option.value, name: option.text});
        }
        let payer_selected = payer.selectedOptions[0]
        selectedValues.push({id: payer_selected.value, name: payer_selected.text})
        console.log(selectedValues)
    
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
            input.class = 'unequal_non_itemized_percentage'
            input.name = `expense[custom_sharer_expenses][${record.id}][percentage]`;
            input.placeholder = "x % of amount"
            input.style = "margin-left: 10px;"
            input.value = ''; // You can set the initial value here if needed
            
            // Create a label for the person's name
            var label = document.createElement('label');
            label.textContent = record.name + ': ';
    
            // Add the label and input field to the container
            container.appendChild(label);
            container.appendChild(input);
    
            // Add a line break after each input field
            container.appendChild(document.createElement('br'));
        });
    }
    
    
    //validation
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
    
    
    // Event listener for sharer selection
    expense_sharers.addEventListener('change', function() {
        // Enable total amount input only if at least one sharer is selected
        console.log(expense_sharers.value.length)
        totalAmountInput.disabled = expense_sharers.value.length === 0;
    });
    
})