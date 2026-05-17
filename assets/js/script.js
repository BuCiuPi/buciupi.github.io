'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

async function loadPartials() {
  const includes = document.querySelectorAll('[data-include]');
  const promises = Array.from(includes).map(async (el) => {
    const file = el.getAttribute('data-include');
    try {
      const response = await fetch(file);
      if (response.ok) {
        el.innerHTML = await response.text();
        // Remove the data-include attribute once loaded
        el.removeAttribute('data-include');
      } else {
        console.error('Failed to load partial: ' + file);
      }
    } catch (e) {
      console.error('Error fetching partial: ' + file, e);
    }
  });

  await Promise.all(promises);

  await loadProjects();

  // Initialize all logic and animations once DOM is fully populated
  initLogic();
  if (typeof initAnimations === 'function') {
    initAnimations();
  }
}

async function loadProjects() {
  const projectListContainer = document.getElementById('project-list');
  if (!projectListContainer) return;

  try {
    const response = await fetch('./assets/data/projects.json');
    if (!response.ok) throw new Error('Failed to load projects');
    const projects = await response.json();

    const templateResponse = await fetch('./partials/portfolio/portfolio_project-item.html');
    if (!templateResponse.ok) throw new Error('Failed to load project template');
    const templateStr = await templateResponse.text();

    const projectHTML = projects.map(project => {
      let itemHTML = templateStr;
      for (const key in project) {
        if (key === 'imageStyle') {
          const styleStr = project[key] ? `style="${project[key]}"` : '';
          itemHTML = itemHTML.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), styleStr);
        } else {
          itemHTML = itemHTML.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), project[key]);
        }
      }
      return itemHTML;
    }).join('');

    projectListContainer.innerHTML = projectHTML;
  } catch (e) {
    console.error('Error loading projects:', e);
  }
}

function initLogic() {
  // sidebar variables
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");

  // sidebar toggle functionality for mobile
  if (sidebarBtn && sidebar) {
    sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
  }

  // custom select variables
  const select = document.querySelector("[data-select]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-selecct-value]");
  const filterBtn = document.querySelectorAll("[data-filter-btn]");

  if (select) {
    select.addEventListener("click", function () { elementToggleFunc(this); });
  }

  // add event in all select items
  for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  }

  // filter variables
  const filterItems = document.querySelectorAll("[data-filter-item]");

  const filterFunc = function (selectedValue) {
    for (let i = 0; i < filterItems.length; i++) {
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
      if (selectValue) selectValue.innerText = this.innerText;
      filterFunc(selectedValue);

      if (lastClickedBtn) lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;
    });
  }

  // contact form variables
  const form = document.querySelector("[data-form]");
  const formInputs = document.querySelectorAll("[data-form-input]");
  const formBtn = document.querySelector("[data-form-btn]");

  // add event to all form input field
  if (form && formBtn) {
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
  }

  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  const pages = document.querySelectorAll("[data-page]");

  const changePage = function (pageName) {
    pages.forEach((page, index) => {
      if (pageName === page.dataset.page) {
        page.classList.add("active");
        if (navigationLinks[index]) navigationLinks[index].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        page.classList.remove("active");
        if (navigationLinks[index]) navigationLinks[index].classList.remove("active");
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
    } else if (pages.length > 0) {
      // Default to the first page if no state exists
      changePage(pages[0].dataset.page);
    }
  });

  // 3. Handle Initial Load (and Refresh)
  const hash = window.location.hash.replace("#", "");
  if (hash) {
    changePage(hash);
  } else if (pages.length > 0) {
    changePage(pages[0].dataset.page);
  }
}

function OpenInNewTab(url) {
  window.open(url, '_blank').focus();
}

// Start loading partials as soon as the DOM is ready
window.addEventListener("DOMContentLoaded", loadPartials);