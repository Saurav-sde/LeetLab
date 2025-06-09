# 📘 Problem Controller - API for Problem Management

This module provides an API layer to **create**, **read**, **update**, and **delete** programming problems for a LeetCode-like platform. It also integrates a submission validation step using external judge utility functions.

---

## 📁 File Structure

```
controllers/
│
├── problemController.js   ← Main API controller (this file)
models/
├── problem.js             ← Mongoose model for problem schema
utils/
├── problemUtility.js      ← Utility functions for judging code (e.g., submitBatch)
```

---

## 🚀 Features

* ✅ Validate problem reference solutions using batch code submission
* ✍️ Create, read, update, and delete problems
* 🔎 Retrieve a single or all problems
* 🧪 Test reference solutions against visible test cases before saving
* 🔒 Uses `req.result._id` to store the problem creator (assumed to be added via middleware)

---

## 🧹 API Functions Explained

### 1. `createProblem(req, res)`

Creates a new problem **after verifying the reference solutions** using visible test cases.

#### Steps:

1. Destructure the request body: title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator.
2. For each reference solution:

   * Convert language name to language ID.
   * Submit each visible test case to an online judge (`submitBatch`).
   * Wait for the tokens to get evaluated via `submitToken`.
   * If any solution fails (`status_id !== 3`), return 400.
3. If all test cases pass, store the problem in the database with the creator's ID (`req.result._id`).

#### Example request:

```json
{
  "title": "Two Sum",
  "description": "Find two numbers that add up to a target.",
  "difficulty": "Easy",
  "tags": ["Array", "HashMap"],
  "visibleTestCases": [{ "input": "2 7 11 15\n9", "output": "0 1" }],
  "hiddenTestCases": [],
  "startCode": { "cpp": "...", "python": "..." },
  "referenceSolution": [{ "language": "cpp", "completeCode": "..." }],
  "problemCreator": "userId"
}
```

---

### 2. `updateProblem(req, res)`

Updates an existing problem after validating updated reference solutions.

#### Steps:

1. Fetch problem by `id` from `req.params`.
2. If the problem doesn’t exist, return 404.
3. For each reference solution:

   * Convert language to ID.
   * Submit test cases.
   * Validate tokens.
   * If any test fails, return 400.
4. Use `findByIdAndUpdate` to update the problem in the DB.

---

### 3. `deleteProblem(req, res)`

Deletes a problem by ID.

#### Steps:

1. Validate that `id` is present.
2. Try to delete using `findByIdAndDelete`.
3. If the problem doesn’t exist, return 404.
4. Return success message if deletion is successful.

---

### 4. `getProblemById(req, res)`

Fetches a single problem by its MongoDB ObjectId.

#### Steps:

1. Get `id` from request parameters.
2. Fetch from DB using `findById`.
3. Return 404 if not found; else, return the problem document.

---

### 5. `getAllProblem(req, res)`

Fetches all the problems from the database.

#### Steps:

1. Use `Problem.find({})` to get all documents.
2. If no problems found, return 404.
3. Return all problems with status 200.

---

## ⚙️ Utility Functions Used (from `problemUtility.js`)

### `getLanguageById(language)`

Returns the judge-specific `language_id` given a language name (e.g., `"cpp"` → `54`).

### `submitBatch(submissionArray)`

Submits a batch of test cases to a judge (e.g., Judge0) and returns an array of tokens.

### `submitToken(tokenArray)`

Fetches the result/status of all submitted tokens. Used to ensure solutions are correct.

---

## 🧪 Reference Solution Validation Logic

This is the **core step** in both `createProblem` and `updateProblem`. It ensures all reference solutions are:

1. **Tested against all visible test cases**
2. **Return correct outputs**
3. **Only saved if all pass**

This prevents storing incorrect problems/solutions in the system.

---

## ✅ Sample API Response

### Success

```json
{
  "message": "Problem Saved Successfully"
}
```

### Failure (e.g., invalid code)

```json
{
  "error": "Error Occurred!"
}
```

---

## 📝 Dependencies

* `mongoose`: For MongoDB interaction
* `express`: To handle API requests
* `problemUtility.js`: Judge0 or similar judge wrapper

---

## 🔐 Assumptions

* `req.result._id` is set via an authentication middleware.
* `Problem` schema is already defined correctly.
* `submitBatch` and `submitToken` work asynchronously and return tokens/results in proper structure.

---

## 📌 TODO

* Add pagination and filtering for `getAllProblem`
* Add middleware validation for inputs
* Add test case limit checks (e.g., max 10 visible test cases)
* Integrate rate-limiting and error logging

---
