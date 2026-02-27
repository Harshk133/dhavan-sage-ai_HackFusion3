# Directive: Refill Prediction Logic

## Goal
Proactively identify patients who will run out of medication soon based on their purchase history, dosage frequency, and current stock.

## Inputs
- User Object (includes a list of `purchase_history` Order IDs).
- Order History (contains the date the order was placed and the exact item `quantity`).
- Medication Master (to understand what the normal `dosage` is).

## Logic (The Math)
1. Iterate over every User.
2. For each User, fetch their `purchase_history` (a list of Order IDs).
3. For each Order ID:
   - Identify the items purchased (`quantity` and `medicine_name`).
   - Identify the `order_date`.
4. Fetch the Medication Master record for that `medicine_name`. Look at the `dosage` text (e.g., "1/day", "2/day").
   - *Assumption for Sandbox Data:* If the `dosage` column only says "500mg" and doesn't specify frequency, assume 1 pill per day for ease of hackathon implementation.
5. Calculate **Depletion Date**: `depletion_date = order_date + (quantity / daily_dosage_frequency) days`.
6. Compare `depletion_date` to `current_date`.
   - If `current_date` is strictly greater than `depletion_date`, the user is out of stock. **Action: Trigger Mock Webhook / Alert to Admins**.
   - If `depletion_date - current_date <= 5 days`, the user is running low. **Action: Preemptively message user saying it is time to refill**.

## Outputs
- List of Alerts (JSON) indicating `user_id`, `medicine_name`, `days_remaining`, and `recommended_action`.
