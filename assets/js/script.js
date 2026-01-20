'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {
    console.log(filterItems[i].dataset.category);
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}

const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

const changePage = function (pageName) {
  pages.forEach((page, index) => {
    if (pageName === page.dataset.page) {
      page.classList.add("active");
      navigationLinks[index].classList.add("active");
      window.scrollTo(0, 0);
    } else {
      page.classList.remove("active");
      navigationLinks[index].classList.remove("active");
    }
  });
};

// 1. Handle Clicks
navigationLinks.forEach(link => {
  link.addEventListener("click", function () {
    const pageName = this.innerHTML.toLowerCase().trim();
    changePage(pageName);
    
    // Push the state to browser history
    history.pushState({ page: pageName }, "", `#${pageName}`);
  });
});

// 2. Handle the "Back" and "Forward" buttons
window.addEventListener("popstate", function (event) {
  if (event.state && event.state.page) {
    changePage(event.state.page);
  } else {
    // Default to the first page if no state exists
    changePage(pages[0].dataset.page);
  }
});

// 3. Handle Initial Load (and Refresh)
window.addEventListener("load", function () {
  const hash = window.location.hash.replace("#", "");
  if (hash) {
    changePage(hash);
  }
});

function OpenInNewTab(url)
{
  window.open(url, '_blank').focus();
}