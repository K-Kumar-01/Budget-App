// BUDGET Controller
const budgetController = (() => {
  let Expense = function (id, description, val) {
    this.id = id;
    this.description = description;
    this.value = val;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    }
  };
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };
  let Income = function (id, description, val) {
    this.id = id;
    this.description = description;
    this.value = val;
  };
  let data = {
    allItems: {
      inc: [],
      exp: [],
    },
    totals: {
      inc: 0,
      exp: 0,
    },
    budget: 0,
    percentage: -1,
  };
  let calculateTotal = function (type) {
    let sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };
  let addItem = (type, des, val) => {
    let newItem, ID;

    // Create new ID
    if (data.allItems[type].length > 0) {
      ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
    } else {
      ID = 0;
    }
    // Create new item based on 'inc' or 'exp' type
    if (type === "exp") {
      newItem = new Expense(ID, des, val);
    } else {
      newItem = new Income(ID, des, val);
    }
    // Push into data structures
    data.allItems[type].push(newItem);
    // Return the new item
    return newItem;
  };

  let deleteItem = function (type, id) {
    let ids, index;
    ids = data.allItems[type].map(function (current) {
      return current.id;
    });
    index = ids.indexOf(id);

    if (index !== -1) {
      data.allItems[type].splice(index, 1);
    }
  };

  let calculateBudget = function () {
    // calculate total income and expenses
    calculateTotal("inc");
    calculateTotal("exp");

    // calculate the budget
    data.budget = data.totals.inc - data.totals.exp;

    // calculate the percentage of income that we spent
    if (data.totals.inc > 0) {
      data.percentage = Math.round((data.totals.exp * 100) / data.totals.inc);
    }
  };

  let getBudget = function () {
    return {
      budget: data.budget,
      totalInc: data.totals.inc,
      totalExp: data.totals.exp,
      percentage: data.percentage,
    };
  };

  let calculatePercentages = function () {
    data.allItems.exp.forEach(function (curr) {
      curr.calcPercentage(data.totals.inc);
    });
  };

  let getPercentages = function () {
    let allPerc = data.allItems.exp.map(function (cur) {
      return cur.getPercentage();
    });
    return allPerc;
  };

  return {
    addItem,
    testing: function () {
      console.log(data);
    },
    calculateBudget,
    getBudget,
    deleteItem,
    calculatePercentages,
    getPercentages,
  };
})();

// UI Controller
const uiController = (() => {
  let domStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  let getInput = () => {
    let type = document.querySelector(domStrings.inputType).value;
    let description = document.querySelector(domStrings.inputDescription).value;
    let value = parseFloat(document.querySelector(domStrings.inputValue).value);
    return {
      type,
      description,
      value,
    };
  };

  let getDOMstrings = () => {
    return domStrings;
  };

  let formatNumber = function (num, type) {
    let numSplit, int, dec, sign;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    type === "exp" ? (sign = "-") : (sign = "+");
    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };
  let nodeListforEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  let displayMonth = function () {
    let now, month, year;
    let months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    now = new Date();

    year = now.getFullYear();
    month = now.getMonth();
    document.querySelector(domStrings.dateLabel).textContent = `${
      months[month - 1]
    } ${year}`;
  };

  let addListItem = (obj, type) => {
    let html, element;
    // Create HTML string with desired text

    if (type === "inc") {
      element = domStrings.incomeContainer;
      html = `<div class="item clearfix" id="inc-${obj.id}">
          <div class="item__description">${(obj.description, type)}</div>
          <div class="right clearfix">
              <div class="item__value">${formatNumber(obj.value)}</div>
              <div class="item__delete">
                  <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
          </div>
      </div>`;
    } else {
      element = domStrings.expensesContainer;
      html = `<div class="item clearfix" id="exp-${obj.id}">
          <div class="item__description">${obj.description}</div>
          <div class="right clearfix">
              <div class="item__value">${formatNumber(obj.value)}</div>
              <div class="item__percentage">21%</div>
              <div class="item__delete">
                  <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
          </div>
      </div>`;
    }
    document.querySelector(element).insertAdjacentHTML("beforeend", html);
  };

  let deleteListItem = function (selectorID) {
    let el = document.getElementById(selectorID);
    el.parentNode.removeChild(el);
  };

  let clearFields = function () {
    document.querySelector(domStrings.inputValue).value = "";
    document.querySelector(domStrings.inputDescription).value = "";
    document.querySelector(domStrings.inputDescription).focus();
  };

  let displayBudget = function (obj) {
    let type;
    obj.budget > 0 ? (type = "inc") : (type = "exp");
    document.querySelector(domStrings.budgetLabel).textContent = formatNumber(
      obj.budget,
      type
    );
    document.querySelector(domStrings.incomeLabel).textContent = formatNumber(
      obj.totalInc,
      "inc"
    );
    document.querySelector(domStrings.expensesLabel).textContent = formatNumber(
      obj.totalExp,
      "exp"
    );
    if (obj.percentage > 0) {
      document.querySelector(domStrings.percentageLabel).textContent =
        obj.percentage + "%";
    } else {
      document.querySelector(domStrings.percentageLabel).textContent = "---";
    }
  };

  let displayPercentages = function (percentages) {
    let fields = document.querySelectorAll(domStrings.expensesPercentLabel);
    nodeListforEach(fields, function (current, index) {
      if (percentages[index] > 0) {
        current.textContent = percentages[index] + "%";
      } else {
        current.textContent = "---";
      }
    });
  };

  return {
    getInput,
    getDOMstrings,
    addListItem,
    clearFields,
    displayBudget,
    deleteListItem,
    displayPercentages,
    displayMonth,
  };
})();

// APP Controller
const controller = ((bdgtCtrl, uiCtrl) => {
  let setupEventListeners = () => {
    let dom = uiController.getDOMstrings();
    document
      .querySelector(dom.inputButton)
      .addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", (e) => {
      if (e.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(dom.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  let updateBudget = function () {
    // 1.Calculate the budget
    budgetController.calculateBudget();

    // 2.Return the budget
    let budget = budgetController.getBudget();

    // 3. Display the budget on the UI
    uiController.displayBudget(budget);
  };

  let updatePercentages = function () {
    // 1. Calculate percentages
    budgetController.calculatePercentages();

    // 2.Read from budget controller
    let percentages = budgetController.getPercentages();

    // 3.Update the DOM with new percentages
    uiController.displayPercentages(percentages);
  };

  let ctrlAddItem = () => {
    let input, newItem;

    // 1. Get the field input data
    input = uiController.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to budget controller
      newItem = budgetController.addItem(
        input.type,
        input.description,
        input.value
      );

      // 3. Add the item to UI
      uiController.addListItem(newItem, input.type);

      // 4.Clear the fields
      uiController.clearFields();

      // 5.Calculate and update budget
      updateBudget();

      // 6.Update percentages
      updatePercentages();
    }
  };

  let ctrlDeleteItem = function (e) {
    let itemID, splitID, type, ID;
    itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      splitID = itemId.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
      // 1. Delete the item from data structure
      budgetController.deleteItem(type, ID);

      // 2.Remove from DOM
      uiController.deleteListItem(itemId);

      // 3.Update the budget
      updateBudget();

      // 4.Update percentages
      updatePercentages();
    }
  };

  let init = () => {
    setupEventListeners();
    uiController.displayMonth();
    uiController.displayBudget({
      budget: 0,
      totalInc: 0,
      totalExp: 0,
      percentage: -1,
    });
  };

  return {
    init,
  };
})();

controller.init();
