# Directive: Inventory Rules

## Goal
Enforce stock level limits when processing medication orders.

## Inputs
- Desired Medication Name
- Desired Quantity
- Current `stock_level` from Database

## Rules
1. **Never** allow an order to proceed if `desired_quantity > stock_level`.
2. If `stock_level` is 0, the medication is "Out of Stock" and the order MUST be rejected outright. 
3. If an order exceeds current `stock_level`, respond politely to the user stating exactly how many units are currently available. Ask if they would like to proceed with the lower quantity.
4. If `desired_quantity <= stock_level`, the validation passes.

## Edge Cases
- If the medication name is misspelled, attempt fuzzy matching. If no match is found, reject the order stating "Medication not recognized."
