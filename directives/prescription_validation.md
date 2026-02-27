# Directive: Prescription Validation

## Goal
Ensure users are legally permitted to order restricted medications.

## Inputs
- Requested Medication object (includes boolean `prescription_required`)
- User object (includes boolean `has_valid_prescription`)

## Rules
1. Check the `prescription_required` flag on the requested medication.
2. If `prescription_required == False`, validation automatically passes.
3. If `prescription_required == True`, check the user's `has_valid_prescription` flag.
4. If `has_valid_prescription == False`, the order MUST be rejected immediately. Do not process inventory or payment. Respond stating a valid prescription on file is required.
5. If `has_valid_prescription == True`, validation passes.

## Notes
- In a production environment, prescriptions expire and are specific to drug types. For this hackathon scope, a single boolean flag `has_valid_prescription` suffices.
