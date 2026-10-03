const API_URL = "http://localhost:3000/api/expenses";

// All expenses from the server, the summary cards use this list, but the table uses a filtered version of it
let allExpenses = [];

//all the elements we need from index.html:
const totalEl = document.getElementById("total");
const countEl = document.getElementById("count");
const highestEl = document.getElementById("highest");
const highestNameEl = document.getElementById("highest-name");
const filterEl = document.getElementById("filter");
const tableBody = document.getElementById("expense-table");

//colored badges
const badgeColors = {
  Food: "bg-success",
  Transport: "bg-primary",
  Bills: "bg-warning text-dark",
  Entertainment: "bg-info text-dark",
  Other: "bg-secondary",
};

// the toggle theme button
const themeToggle = document.getElementById('theme-toggle');
  
  function setTheme(theme) {
  document.documentElement.setAttribute("data-bs-theme", theme);
  localStorage.setItem("theme", theme); // remember the choice after reload
}

// use the saved theme when the page opens (light if nothing was saved)
setTheme(localStorage.getItem("theme") || "light");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-bs-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

const alertContainer = document.getElementById("alert-container");
const spinnerEl = document.getElementById("spinner");

// show a red alert at the top of the page
function showAlert(message) {
  alertContainer.innerHTML = "";
  const alert = document.createElement("div");
  alert.className = "alert alert-danger alert-dismissible fade show";
  alert.setAttribute("role", "alert");
  alert.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "btn-close";
  closeBtn.setAttribute("data-bs-dismiss", "alert");
  closeBtn.setAttribute("aria-label", "Close");

  alert.appendChild(closeBtn);
  alertContainer.appendChild(alert);
}

function showSpinner() {
  spinnerEl.classList.remove("d-none");
}

function hideSpinner() {
  spinnerEl.classList.add("d-none");
}

//to send the request/fetch and reads JSON
async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    // fetch only throws when it can't reach the server at all
    throw new Error(
      "Cannot connect to the server. Make sure it is running and try again",
    );
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      (data && data.message) || "Server error " + response.status,
    );
  }
  return data;
}
///////////////////////////////////////
async function getExpenses() {
  return request(API_URL);
}

async function addExpense(data) {
  return request(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function updateExpense(id, data) {
  return request(API_URL + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function deleteExpense(id) {
  return request(API_URL + "/" + id, { method: "DELETE" });
}

async function refresh() {
  showSpinner();
  try {
    allExpenses = await getExpenses();
    alertContainer.innerHTML = ""; // clear any previous alert
    renderSummary(allExpenses);
    applyFilter(); // this calls renderTable, (for example if the filter was on "Bills" and i deleted an expense, the renderTable
    //  would show EVERY category again while the filter/dropdown list still says "Bills") so i added the applyFilter instead of renderTable
  } catch (err) {
    showAlert(err.message);
  } finally {
    hideSpinner();
  }
}

function renderSummary(list) {
  const total = list.reduce((sum, e) => sum + Number(e.amount), 0);
  totalEl.textContent = total.toFixed(2);

  countEl.textContent = list.length;

  // if the list was empty:
  if (list.length === 0) {
    highestEl.textContent = "0.00";
    highestNameEl.textContent = "-";
    return;
  }

  const highest = list.reduce((max, e) =>
    Number(e.amount) > Number(max.amount) ? e : max,
  );
  highestEl.textContent = Number(highest.amount).toFixed(2);
  highestNameEl.textContent = highest.title;
}

///////////////////////////////////***********************************//////////////////////////////////

// create one <td> with text
//<td class = "className"> textContent </td>

function createCell(text, className) {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function renderTable(list) {
  tableBody.innerHTML = ""; // to empty the table

  //if table was empty
  if (list.length === 0) {
    const tr = document.createElement("tr");
    const td = createCell("No expenses to show", "text-center text-muted");
    td.colSpan = 5;
    tr.appendChild(td);
    tableBody.appendChild(tr);
    return;
  }

  //each expense is a row tr that has cells td, last td has two buttons
  list.forEach((expense) => {
    const tr = document.createElement("tr");
    tr.appendChild(createCell(expense.title));
    tr.appendChild(createCell(Number(expense.amount).toFixed(2), "text-end"));

    //category as a badge
    //<td><span class = "badge"></span></td>
    const categoryID = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge " + badgeColors[expense.category];
    badge.textContent = expense.category;
    categoryID.appendChild(badge);
    tr.appendChild(categoryID);

    tr.appendChild(createCell(expense.date));

    //actions buttons
    const actionsID = document.createElement("td");
    actionsID.className = "text-end";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-secondary me-2 edit-btn";
    editBtn.textContent = "Edit";
    editBtn.dataset.id = expense.id;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-outline-danger delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.dataset.id = expense.id;

    actionsID.append(editBtn, deleteBtn);
    tr.appendChild(actionsID);

    tableBody.appendChild(tr);
  });
}

// call the renderTable with the list filtered by the selected category
function applyFilter() {
  const selectedFilter = filterEl.value;
  const filteredList =
    selectedFilter === "All"
      ? allExpenses
      : allExpenses.filter((e) => e.category === selectedFilter);
  renderTable(filteredList);
}
/* ---------- Start ---------- */

filterEl.addEventListener("change", applyFilter);

tableBody.addEventListener("click", async (event) => {
  const deleteBtn = event.target.closest(".delete-btn");
  if (!deleteBtn) {
    return; //the click wasn't on the delete button
  }

  const id = deleteBtn.dataset.id;
  try {
    await deleteExpense(id);
    await refresh();
  } catch (err) {
    showAlert(err.message);
  }
});

//form submission and validation
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // so the page doesn't reload by default

  //clear the errors from the previous attempt
  [titleInput, amountInput, categoryInput, dateInput].forEach((input) =>
    input.classList.remove("is-invalid"),
  );
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  let isValid = true;

  if (title === "") {
    titleInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!(amount > 0)) {
    amountInput.classList.add("is-invalid");
    isValid = false;
  }
  if (category === "") {
    categoryInput.classList.add("is-invalid");
    isValid = false;
  }
  if (date === "") {
    dateInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!isValid) return;

  try {
    await addExpense({ title, amount, category, date });
    form.reset();
    await refresh();
  } catch (err) {
    showAlert(err.message);
  }
});

//////////////////////////////////////////////
//////////////////////////////////////////////

//edit modal
const editModal = new bootstrap.Modal(document.getElementById("edit-modal"));
const editForm = document.getElementById("edit-form");
const editIdInput = document.getElementById("edit-id");
const editTitleInput = document.getElementById("edit-title");
const editAmountInput = document.getElementById("edit-amount");
const editCategoryInput = document.getElementById("edit-category");
const editDateInput = document.getElementById("edit-date");

// the click on "Edit" fills the modal with the expense's current data and open it
tableBody.addEventListener("click", (event) => {
  const editBtn = event.target.closest(".edit-btn");
  if (!editBtn) return;

  const expense = allExpenses.find((e) => e.id === Number(editBtn.dataset.id));
  if (!expense) return;

  //fill values
  editIdInput.value = expense.id;
  editTitleInput.value = expense.title;
  editAmountInput.value = expense.amount;
  editCategoryInput.value = expense.category;
  editDateInput.value = expense.date;

  [editTitleInput, editAmountInput, editDateInput].forEach((input) =>
    input.classList.remove("is-invalid"),
  );
  editModal.show();
});

// the click on "Save changes" validates, sends PUT, closes the modal, reloads
editForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  [editTitleInput, editAmountInput, editDateInput].forEach((input) =>
    input.classList.remove("is-invalid"),
  );

  const id = editIdInput.value;
  const title = editTitleInput.value.trim();
  const amount = Number(editAmountInput.value);
  const category = editCategoryInput.value;
  const date = editDateInput.value;

  let isValid = true;
  if (title === "") {
    editTitleInput.classList.add("is-invalid");
    isValid = false;
  }
  if (!(amount > 0)) {
    editAmountInput.classList.add("is-invalid");
    isValid = false;
  }
  if (date === "") {
    editDateInput.classList.add("is-invalid");
    isValid = false;
  }
  if (!isValid) return;

  try {
    await updateExpense(id, { title, amount, category, date });
    editModal.hide();
    await refresh();
  } catch (err) {
    editModal.hide();
    showAlert(err.message);
  }
});


// export all expenses as a CSV file
function exportCsv() {
  let csv = "Title, Amount, Category, Date\n";

  allExpenses.forEach((e) => {
    csv += `${e.title}, ${e.amount}, ${e.category}, ${e.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" }); // turn the string into a file object
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expenses.csv";
  link.click();
}

document.getElementById("export-btn").addEventListener("click", exportCsv);

refresh();
