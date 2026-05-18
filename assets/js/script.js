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
  await loadResume();
  await loadAbout();

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

async function loadResume() {
  const experienceList = document.getElementById('experience-list');
  const educationList = document.getElementById('education-list');
  const skillsList = document.getElementById('skills-list');

  if (!experienceList && !educationList && !skillsList) return;

  try {
    const response = await fetch('./assets/data/resume.json');
    if (!response.ok) throw new Error('Failed to load resume data');
    const resumeData = await response.json();

    if (experienceList && resumeData.experience) {
      const expTemplateRes = await fetch('./partials/resume/resume-experience-item.html');
      const expDescTemplateRes = await fetch('./partials/resume/resume-experience-desc-item.html');
      if (expTemplateRes.ok && expDescTemplateRes.ok) {
        const expTemplate = await expTemplateRes.text();
        const expDescTemplate = await expDescTemplateRes.text();
        experienceList.innerHTML = resumeData.experience.map(item => {
          let html = expTemplate;
          for (const key in item) {
            if (key === 'descriptions') {
              const descHtml = item.descriptions.map(desc => expDescTemplate.replace(/\{\{text\}\}/g, desc)).join('');
              html = html.replace(/\{\{descriptions\}\}/g, descHtml);
            } else {
              html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), item[key]);
            }
          }
          return html;
        }).join('');
      }
    }

    if (educationList && resumeData.education) {
      const eduTemplateRes = await fetch('./partials/resume/resume-education-item.html');
      const eduDescTemplateRes = await fetch('./partials/resume/resume-education-desc-item.html');
      if (eduTemplateRes.ok && eduDescTemplateRes.ok) {
        const eduTemplate = await eduTemplateRes.text();
        const eduDescTemplate = await eduDescTemplateRes.text();
        educationList.innerHTML = resumeData.education.map(item => {
          let html = eduTemplate;
          for (const key in item) {
            if (key === 'descriptions') {
              const descHtml = item.descriptions.map(desc => {
                let dHtml = eduDescTemplate;
                for (const dKey in desc) {
                  dHtml = dHtml.replace(new RegExp(`\\{\\{${dKey}\\}\\}`, 'g'), desc[dKey]);
                }
                return dHtml;
              }).join('');
              html = html.replace(/\{\{descriptions\}\}/g, descHtml);
            } else {
              html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), item[key]);
            }
          }
          return html;
        }).join('');
      }
    }

    if (skillsList && resumeData.skills) {
      const skillTemplateRes = await fetch('./partials/resume/resume-skill-item.html');
      const skillDescTemplateRes = await fetch('./partials/resume/resume-skill-list-item.html');
      if (skillTemplateRes.ok && skillDescTemplateRes.ok) {
        const skillTemplate = await skillTemplateRes.text();
        const skillDescTemplate = await skillDescTemplateRes.text();
        skillsList.innerHTML = resumeData.skills.map(item => {
          let html = skillTemplate;
          for (const key in item) {
            if (key === 'skills') {
              const skillsHtml = item.skills.map(skill => skillDescTemplate.replace(/\{\{skill\}\}/g, skill)).join('');
              html = html.replace(/\{\{skills\}\}/g, skillsHtml);
            } else {
              html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), item[key]);
            }
          }
          return html;
        }).join('');
      }
    }
  } catch (e) {
    console.error('Error loading resume:', e);
  }
}

async function loadAbout() {
  const aboutText = document.getElementById('about-text');
  const servicesList = document.getElementById('about-services-list');
  const mainSkillsList = document.getElementById('about-skills-list');
  const toolsList = document.getElementById('about-tools-list');

  if (!aboutText && !servicesList && !mainSkillsList && !toolsList) return;

  try {
    const response = await fetch('./assets/data/about.json');
    if (!response.ok) throw new Error('Failed to load about data');
    const aboutData = await response.json();

    if (aboutText && aboutData.aboutText) {
      aboutText.innerText = aboutData.aboutText;
    }

    if (servicesList && aboutData.services) {
      const srvTemplateRes = await fetch('./partials/about/about-service-item.html');
      if (srvTemplateRes.ok) {
        const srvTemplate = await srvTemplateRes.text();
        servicesList.innerHTML = aboutData.services.map(item => {
          let html = srvTemplate;
          for (const key in item) {
            html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), item[key] || '');
          }
          html = html.replace(/class=""/g, '');
          return html;
        }).join('');
      }
    }

    if (mainSkillsList && aboutData.mainSkills) {
      const skillTemplateRes = await fetch('./partials/about/about-skill-item.html');
      const skillDescTemplateRes = await fetch('./partials/about/about-skill-list-item.html');
      if (skillTemplateRes.ok && skillDescTemplateRes.ok) {
        const skillTemplate = await skillTemplateRes.text();
        const skillDescTemplate = await skillDescTemplateRes.text();
        mainSkillsList.innerHTML = aboutData.mainSkills.map(item => {
          let html = skillTemplate;
          for (const key in item) {
            if (key === 'skills') {
              const skillsHtml = item.skills.map(skill => skillDescTemplate.replace(/\{\{skill\}\}/g, skill)).join('');
              html = html.replace(/\{\{skills\}\}/g, skillsHtml);
            } else {
              html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), item[key]);
            }
          }
          return html;
        }).join('');
      }
    }

    if (toolsList && aboutData.tools) {
      const toolTemplateRes = await fetch('./partials/about/about-tool-item.html');
      if (toolTemplateRes.ok) {
        const toolTemplate = await toolTemplateRes.text();
        toolsList.innerHTML = aboutData.tools.map(item => {
          let html = toolTemplate;
          for (const key in item) {
            html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), item[key]);
          }
          return html;
        }).join('');
      }
    }
  } catch (e) {
    console.error('Error loading about:', e);
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