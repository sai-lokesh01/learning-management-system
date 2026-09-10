/* ==========================================================================
   SkillNova — single JavaScript file for the whole site

   1. HELPERS
   2. COURSE DATA
   3. STORAGE + CART LOGIC
   4. SHARED UI (navbar, tabs, accordion, form validation)
   5. PAGE ROUTER
   6. PAGE FUNCTIONS
   ========================================================================== */


/* ==========================================================================
   1. HELPERS
   ========================================================================== */

// Short way to grab one element:  $("#cartCount")
function $(selector) {
  return document.querySelector(selector);
}

// Short way to grab many elements: $$(".course-card")
function $$(selector) {
  return document.querySelectorAll(selector);
}

// Read a saved value from localStorage.
// localStorage only stores text, so we convert it back with JSON.parse.
function getStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

// Save a value to localStorage as text.
function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Format a number as rupees: 1499 -> "₹1,499"
function formatPrice(amount) {
  if (amount === 0) return "Free";
  return "₹" + amount.toLocaleString("en-IN");
}

// Turn "2026-03-14T..." into "14 Mar 2026"
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// Read a value out of the address bar: courses.html?search=python
function getUrlValue(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}

// Escape text before putting it inside HTML.
// Without this, someone typing <script> into a review would break the page.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Turn 4.7 into "★★★★★" with only the earned ones filled
function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/* ==========================================================================
   2. COURSE DATA
   This is our fake database. In a real project it would come from a server.
   ========================================================================== */

const COURSES = [
  {
    id: "c1",
    title: "Complete Web Development Bootcamp",
    category: "Web Development",
    level: "Beginner",
    instructor: "Ananya Sharma",
    instructorRole: "Co-founder, Curriculum at SkillNova",
    instructorBio: "Eight years building web products. Writes most of our frontend track and still teaches one batch every term.",
    instructorCourses: 4,
    price: 1499,
    rating: 4.8,
    reviews: 1240,
    students: 8600,
    hours: 42,
    lessons: 96,
    language: "English",
    badge: "Bestseller",
    thumb: "thumb-1",
    createdOn: "2025-11-02",
    tagline: "Go from a blank file to a deployed website you can show an employer.",
    description: "This course walks through HTML, CSS and JavaScript from scratch, then puts them together into three real projects. You write every line yourself. By the end you will have a portfolio site, a course catalogue and a small dashboard, all deployed and live.",
    learn: ["Structure any page with semantic HTML", "Lay out designs using Flexbox and Grid", "Handle events and update the DOM with JavaScript", "Store data in the browser with localStorage", "Make sites work on phones", "Deploy to a live URL for free"],
    requirements: ["A laptop with a browser and a text editor", "No prior coding experience needed"],
    syllabus: [
      { title: "Getting started with HTML", lessons: ["How the web works", "Tags, elements and attributes", "Forms and inputs"] },
      { title: "Styling with CSS", lessons: ["Selectors and the cascade", "Flexbox in practice", "Grid and responsive layouts"] },
      { title: "JavaScript foundations", lessons: ["Variables and functions", "Arrays and objects", "The DOM and events"] },
      { title: "Building the final project", lessons: ["Planning the structure", "Writing the JavaScript", "Deploying it live"] }
    ]
  },
  {
    id: "c2",
    title: "Data Structures & Algorithms in Java",
    category: "Programming",
    level: "Intermediate",
    instructor: "Rahul Menon",
    instructorRole: "Co-founder, Engineering at SkillNova",
    instructorBio: "Former backend engineer. Handles the platform, and teaches the algorithms course nobody else wants to take on.",
    instructorCourses: 3,
    price: 1999,
    rating: 4.9,
    reviews: 2130,
    students: 11200,
    hours: 60,
    lessons: 140,
    language: "English",
    badge: "Bestseller",
    thumb: "thumb-2",
    createdOn: "2025-08-19",
    tagline: "The course that gets you through a technical interview.",
    description: "Every topic that shows up in placement rounds, in the order they get asked. Each concept comes with hand-traced examples first, then code, then problems from real interview sets. You solve over 200 problems across the course.",
    learn: ["Reason about time and space complexity", "Work fluently with arrays, strings and hashing", "Build and traverse trees and graphs", "Apply recursion and dynamic programming", "Pick the right data structure under pressure", "Explain your approach out loud"],
    requirements: ["Basic Java syntax: loops, functions, classes", "Patience for problems that take an hour"],
    syllabus: [
      { title: "Complexity and arrays", lessons: ["Big O without the maths", "Two pointers", "Sliding window"] },
      { title: "Hashing and strings", lessons: ["HashMap patterns", "Frequency counting", "String manipulation"] },
      { title: "Trees and graphs", lessons: ["Binary trees and traversals", "BFS and DFS", "Shortest paths"] },
      { title: "Recursion and DP", lessons: ["Thinking recursively", "Memoisation", "Classic DP problems"] }
    ]
  },
  {
    id: "c3",
    title: "Python for Data Analysis",
    category: "Data Science",
    level: "Beginner",
    instructor: "Priya Nair",
    instructorRole: "Head of Learning at SkillNova",
    instructorBio: "Watches every batch's progress data and tells trainers when a cohort is quietly falling behind.",
    instructorCourses: 5,
    price: 1299,
    rating: 4.6,
    reviews: 870,
    students: 6400,
    hours: 28,
    lessons: 64,
    language: "English",
    badge: "",
    thumb: "thumb-3",
    createdOn: "2026-01-12",
    tagline: "Turn messy spreadsheets into answers people can act on.",
    description: "A practical tour of pandas, NumPy and matplotlib using real datasets that are deliberately messy. You clean them, question them, chart them and write up what you found.",
    learn: ["Load and clean real-world data", "Filter, group and aggregate with pandas", "Handle missing and duplicate values", "Build charts that make a point", "Write a short data report", "Automate a repeating analysis"],
    requirements: ["Basic Python: variables, loops, functions", "Python installed, or a free Colab account"],
    syllabus: [
      { title: "Python refresher", lessons: ["Lists and dictionaries", "Reading files", "Working in notebooks"] },
      { title: "pandas essentials", lessons: ["DataFrames and Series", "Selecting and filtering", "Groupby and merge"] },
      { title: "Cleaning data", lessons: ["Missing values", "Duplicates and outliers", "Type conversion"] },
      { title: "Charts and reporting", lessons: ["Matplotlib basics", "Choosing a chart", "Writing up findings"] }
    ]
  },
  {
    id: "c4",
    title: "UI Design Fundamentals with Figma",
    category: "Design",
    level: "Beginner",
    instructor: "Kabir Shah",
    instructorRole: "Design Lead at SkillNova",
    instructorBio: "Designs the platform and runs the Figma course. Believes most interfaces have one screen too many.",
    instructorCourses: 2,
    price: 0,
    rating: 4.5,
    reviews: 540,
    students: 9800,
    hours: 14,
    lessons: 32,
    language: "English",
    badge: "Free",
    thumb: "thumb-4",
    createdOn: "2026-02-08",
    tagline: "Design screens that developers can actually build.",
    description: "Learn the parts of Figma that matter on a real team: components, auto layout, and handing off to engineers. Ends with a full app redesign you can put in a portfolio.",
    learn: ["Set up a type and colour system", "Build reusable components", "Use auto layout properly", "Prototype a working flow", "Hand off specs to developers", "Critique your own screens"],
    requirements: ["A free Figma account", "No design background needed"],
    syllabus: [
      { title: "Figma basics", lessons: ["The interface", "Frames and shapes", "Text and type scales"] },
      { title: "Systems", lessons: ["Colour and style tokens", "Components and variants", "Auto layout"] },
      { title: "Putting it together", lessons: ["Wireframe to high fidelity", "Prototyping a flow", "Developer handoff"] }
    ]
  },
  {
    id: "c5",
    title: "React from the Ground Up",
    category: "Web Development",
    level: "Intermediate",
    instructor: "Ananya Sharma",
    instructorRole: "Co-founder, Curriculum at SkillNova",
    instructorBio: "Eight years building web products. Writes most of our frontend track and still teaches one batch every term.",
    instructorCourses: 4,
    price: 1799,
    rating: 4.7,
    reviews: 960,
    students: 5100,
    hours: 36,
    lessons: 84,
    language: "English",
    badge: "",
    thumb: "thumb-1",
    createdOn: "2026-03-01",
    tagline: "Understand what React is doing, not just how to type it.",
    description: "Starts by rebuilding a tiny version of React so the rest of the course makes sense. Then covers hooks, routing, forms and data fetching through one application that grows week by week.",
    learn: ["Think in components", "Manage state with hooks", "Fetch and cache server data", "Handle forms and validation", "Split code across routes", "Debug re-render problems"],
    requirements: ["Solid JavaScript, especially arrays and functions", "Comfort with the terminal and npm"],
    syllabus: [
      { title: "How React works", lessons: ["The virtual DOM", "JSX explained", "Your first component"] },
      { title: "State and hooks", lessons: ["useState and useEffect", "Lifting state up", "Custom hooks"] },
      { title: "Real applications", lessons: ["Routing", "Forms", "Fetching data"] }
    ]
  },
  {
    id: "c6",
    title: "SQL and Database Design",
    category: "Data Science",
    level: "Beginner",
    instructor: "Priya Nair",
    instructorRole: "Head of Learning at SkillNova",
    instructorBio: "Watches every batch's progress data and tells trainers when a cohort is quietly falling behind.",
    instructorCourses: 5,
    price: 999,
    rating: 4.4,
    reviews: 610,
    students: 4300,
    hours: 22,
    lessons: 48,
    language: "English",
    badge: "",
    thumb: "thumb-2",
    createdOn: "2025-09-25",
    tagline: "Ask a database a hard question and get an answer back.",
    description: "Covers querying from the first lesson, then works backwards into why tables are designed the way they are. Every lesson uses one sample database you keep building on.",
    learn: ["Write joins without guessing", "Aggregate and window over rows", "Design tables that avoid duplication", "Add indexes where they help", "Read a slow query plan", "Avoid the classic beginner mistakes"],
    requirements: ["No prior database experience", "Any SQL tool, we use free ones"],
    syllabus: [
      { title: "Querying", lessons: ["SELECT and WHERE", "Joins", "Grouping and aggregates"] },
      { title: "Designing", lessons: ["Keys and relationships", "Normalisation", "Constraints"] },
      { title: "Going faster", lessons: ["Indexes", "Reading query plans", "Common mistakes"] }
    ]
  },
  {
    id: "c7",
    title: "AWS Cloud Practitioner Prep",
    category: "Cloud & DevOps",
    level: "Beginner",
    instructor: "Meera Joshi",
    instructorRole: "Cloud Architect",
    instructorBio: "Spent six years moving companies off their own servers. Teaches cloud the way she wishes someone had taught her.",
    instructorCourses: 3,
    price: 1599,
    rating: 4.6,
    reviews: 720,
    students: 3900,
    hours: 26,
    lessons: 58,
    language: "English",
    badge: "",
    thumb: "thumb-3",
    createdOn: "2026-02-20",
    tagline: "Pass the exam, and understand what you're passing.",
    description: "Follows the official exam outline but stops at every service to actually use it in the free tier. You finish with a certificate-ready understanding and a small deployed application.",
    learn: ["Explain core AWS services", "Understand the pricing model", "Set up IAM users safely", "Deploy a small application", "Read the shared responsibility model", "Sit the exam with confidence"],
    requirements: ["A free AWS account", "Basic understanding of how servers work"],
    syllabus: [
      { title: "Cloud concepts", lessons: ["What the cloud actually is", "Regions and availability zones", "The pricing model"] },
      { title: "Core services", lessons: ["EC2 and storage", "Networking basics", "Databases on AWS"] },
      { title: "Security and exam prep", lessons: ["IAM", "Shared responsibility", "Practice questions"] }
    ]
  },
  {
    id: "c8",
    title: "Docker and Kubernetes in Practice",
    category: "Cloud & DevOps",
    level: "Advanced",
    instructor: "Meera Joshi",
    instructorRole: "Cloud Architect",
    instructorBio: "Spent six years moving companies off their own servers. Teaches cloud the way she wishes someone had taught her.",
    instructorCourses: 3,
    price: 2299,
    rating: 4.8,
    reviews: 430,
    students: 2100,
    hours: 38,
    lessons: 76,
    language: "English",
    badge: "",
    thumb: "thumb-4",
    createdOn: "2025-12-05",
    tagline: "Ship containers without the guesswork.",
    description: "For engineers who already deploy something and want to do it properly. Builds a multi-service application, containerises it, then runs it on a real cluster with health checks and rolling updates.",
    learn: ["Write efficient Dockerfiles", "Compose multi-service setups", "Understand pods and services", "Configure health checks", "Roll out updates safely", "Debug a failing container"],
    requirements: ["Comfort with the Linux command line", "Some experience deploying an application"],
    syllabus: [
      { title: "Docker", lessons: ["Images and layers", "Writing a Dockerfile", "Compose"] },
      { title: "Kubernetes basics", lessons: ["Pods and deployments", "Services and ingress", "Config and secrets"] },
      { title: "Running in production", lessons: ["Health checks", "Rolling updates", "Debugging"] }
    ]
  },
  {
    id: "c9",
    title: "Git and GitHub for Teams",
    category: "Programming",
    level: "Beginner",
    instructor: "Rahul Menon",
    instructorRole: "Co-founder, Engineering at SkillNova",
    instructorBio: "Former backend engineer. Handles the platform, and teaches the algorithms course nobody else wants to take on.",
    instructorCourses: 3,
    price: 0,
    rating: 4.7,
    reviews: 1580,
    students: 14200,
    hours: 9,
    lessons: 24,
    language: "English",
    badge: "Free",
    thumb: "thumb-1",
    createdOn: "2026-01-30",
    tagline: "Stop being scared of merge conflicts.",
    description: "Short and hands-on. Covers the twenty Git commands that cover ninety percent of daily work, plus how to recover when something goes wrong.",
    learn: ["Commit with a clear history", "Branch and merge confidently", "Resolve conflicts calmly", "Open and review pull requests", "Undo almost any mistake", "Work on a shared repository"],
    requirements: ["A free GitHub account", "Any code project to practise on"],
    syllabus: [
      { title: "The basics", lessons: ["Repositories and commits", "Staging explained", "Reading the log"] },
      { title: "Branching", lessons: ["Creating branches", "Merging", "Resolving conflicts"] },
      { title: "Working with others", lessons: ["Pull requests", "Code review", "Undoing mistakes"] }
    ]
  },
  {
    id: "c10",
    title: "Product Management for Engineers",
    category: "Business",
    level: "Intermediate",
    instructor: "Sneha Rao",
    instructorRole: "Product Lead",
    instructorBio: "Started as a developer, moved into product, and now helps engineers make the same jump without losing their technical edge.",
    instructorCourses: 2,
    price: 1399,
    rating: 4.3,
    reviews: 290,
    students: 1800,
    hours: 18,
    lessons: 40,
    language: "English",
    badge: "",
    thumb: "thumb-2",
    createdOn: "2026-03-18",
    tagline: "For engineers who keep getting asked what to build next.",
    description: "Covers discovery, prioritisation and roadmaps from an engineer's point of view. Heavy on real trade-off decisions, light on frameworks for their own sake.",
    learn: ["Run a customer interview", "Write a clear problem statement", "Prioritise without guessing", "Build a roadmap you can defend", "Measure whether a feature worked", "Say no with reasons"],
    requirements: ["Some experience shipping software", "Willingness to talk to users"],
    syllabus: [
      { title: "Discovery", lessons: ["Finding the real problem", "Customer interviews", "Writing it down"] },
      { title: "Deciding", lessons: ["Prioritisation methods", "Trade-offs", "Roadmaps"] },
      { title: "Measuring", lessons: ["Choosing metrics", "Reading the data", "Killing features"] }
    ]
  },
  {
    id: "c11",
    title: "Advanced JavaScript Patterns",
    category: "Web Development",
    level: "Advanced",
    instructor: "Ananya Sharma",
    instructorRole: "Co-founder, Curriculum at SkillNova",
    instructorBio: "Eight years building web products. Writes most of our frontend track and still teaches one batch every term.",
    instructorCourses: 4,
    price: 1899,
    rating: 4.9,
    reviews: 380,
    students: 1600,
    hours: 30,
    lessons: 62,
    language: "English",
    badge: "",
    thumb: "thumb-3",
    createdOn: "2025-10-14",
    tagline: "The parts of JavaScript that trip up experienced developers.",
    description: "Closures, the event loop, prototypes, async patterns and memory. Each topic starts with a puzzle that fails in a surprising way, then explains why.",
    learn: ["Explain the event loop precisely", "Use closures deliberately", "Understand prototypes and this", "Write correct async code", "Avoid memory leaks", "Read other people's tricky code"],
    requirements: ["At least a year of JavaScript", "Comfort with browser dev tools"],
    syllabus: [
      { title: "Execution", lessons: ["Scope and closures", "The event loop", "this and binding"] },
      { title: "Async", lessons: ["Promises in depth", "async and await", "Error handling"] },
      { title: "Performance", lessons: ["Memory leaks", "Profiling", "Optimisation traps"] }
    ]
  },
  {
    id: "c12",
    title: "Machine Learning Foundations",
    category: "Data Science",
    level: "Intermediate",
    instructor: "Priya Nair",
    instructorRole: "Head of Learning at SkillNova",
    instructorBio: "Watches every batch's progress data and tells trainers when a cohort is quietly falling behind.",
    instructorCourses: 5,
    price: 2099,
    rating: 4.5,
    reviews: 660,
    students: 3400,
    hours: 44,
    lessons: 92,
    language: "English",
    badge: "",
    thumb: "thumb-4",
    createdOn: "2026-02-27",
    tagline: "Build models you can explain to someone else.",
    description: "Regression through to ensembles, with the maths kept to what you need to reason about results. Every algorithm is implemented once by hand before using a library.",
    learn: ["Frame a problem as a model", "Split and validate data properly", "Fit regression and classification models", "Read a confusion matrix", "Tune without overfitting", "Explain a model's decisions"],
    requirements: ["Python and pandas", "School-level maths"],
    syllabus: [
      { title: "Getting started", lessons: ["What ML can and cannot do", "Train and test splits", "Your first model"] },
      { title: "Core algorithms", lessons: ["Linear and logistic regression", "Decision trees", "Ensembles"] },
      { title: "Doing it well", lessons: ["Evaluation metrics", "Overfitting", "Explaining results"] }
    ]
  }
];

// Coupon codes the cart accepts
const COUPONS = {
  LEARN20:  { type: "percent", value: 20, label: "LEARN20" },
  FIRST10:  { type: "percent", value: 10, label: "FIRST10" },
  SKILL500: { type: "flat",    value: 500, label: "SKILL500" }
};

const GST_RATE = 0.18;

// Find one course by its id
function findCourse(id) {
  return COURSES.find(function (course) {
    return course.id === id;
  });
}

/* ==========================================================================
   3. STORAGE + CART LOGIC
   Every page shares these, so the numbers always agree.
   ========================================================================== */

function getCurrentUser()  { return getStorage("currentUser", null); }
function getCart()         { return getStorage("cart", []); }
function getWishlist()     { return getStorage("wishlist", []); }
function getEnrolled()     { return getStorage("enrolled", []); }
function getOrders()       { return getStorage("orders", []); }

// Add a course to the cart. Returns a short status word.
function addToCart(courseId) {
  const enrolled = getEnrolled();
  const alreadyOwned = enrolled.some(function (item) {
    return item.id === courseId;
  });
  if (alreadyOwned) return "owned";

  const cart = getCart();
  if (cart.includes(courseId)) return "already";

  cart.push(courseId);
  setStorage("cart", cart);
  updateCartCount();
  return "added";
}

function removeFromCart(courseId) {
  const cart = getCart().filter(function (id) {
    return id !== courseId;
  });
  setStorage("cart", cart);
  updateCartCount();
}

// Add or remove from the saved list. Returns true if it is now saved.
function toggleWishlist(courseId) {
  let list = getWishlist();

  if (list.includes(courseId)) {
    list = list.filter(function (id) { return id !== courseId; });
    setStorage("wishlist", list);
    return false;
  }

  list.push(courseId);
  setStorage("wishlist", list);
  return true;
}

// Work out every number the summary boxes need, in one place
function getCartTotals() {
  const courses = getCart()
    .map(findCourse)
    .filter(Boolean);              // drop any id that no longer exists

  const subtotal = courses.reduce(function (sum, course) {
    return sum + course.price;
  }, 0);

  const coupon = getStorage("coupon", null);
  let discount = 0;

  if (coupon) {
    if (coupon.type === "percent") {
      discount = Math.round(subtotal * coupon.value / 100);
    } else {
      discount = Math.min(coupon.value, subtotal);
    }
  }

  const taxable = subtotal - discount;
  const tax = Math.round(taxable * GST_RATE);
  const total = taxable + tax;

  return {
    courses: courses,
    subtotal: subtotal,
    coupon: coupon,
    discount: discount,
    tax: tax,
    total: total
  };
}

// Fill the summary box. Used by cart, checkout and payment — same ids on all three.
function renderSummary() {
  const totals = getCartTotals();

  const subtotalEl = $("#summarySubtotal");
  if (!subtotalEl) return totals;

  subtotalEl.textContent = formatPrice(totals.subtotal);
  $("#summaryTax").textContent = formatPrice(totals.tax);
  $("#summaryTotal").textContent = formatPrice(totals.total);

  const discountRow = $("#discountRow");
  if (discountRow) {
    if (totals.discount > 0) {
      discountRow.hidden = false;
      $("#appliedCouponName").textContent = totals.coupon.label;
      $("#summaryDiscount").textContent = "−" + formatPrice(totals.discount);
    } else {
      discountRow.hidden = true;
    }
  }

  // The small item list that checkout and payment show
  const itemBox = $("#summaryItems");
  if (itemBox) {
    itemBox.innerHTML = totals.courses.map(function (course) {
      return '<div class="summary-item">' +
               "<span>" + escapeHtml(course.title) + "</span>" +
               "<span>" + formatPrice(course.price) + "</span>" +
             "</div>";
    }).join("");
  }

  return totals;
}

// One course card, reused on home, courses, cart wishlist and dashboards
function courseCardHtml(course) {
  const badge = course.badge
    ? '<span class="badge badge-light">' + course.badge + "</span>"
    : "";

  return '<article class="course-card">' +
    '<div class="course-thumb ' + course.thumb + '">' + badge + "</div>" +
    '<div class="course-body">' +
      '<p class="course-category">' + escapeHtml(course.category) + "</p>" +
      "<h3>" + escapeHtml(course.title) + "</h3>" +
      '<p class="muted small">' + escapeHtml(course.instructor) + "</p>" +
      '<div class="course-meta">' +
        '<span class="rating">' + course.rating + " ★</span>" +
        '<span class="muted small">' + course.hours + " hours</span>" +
      "</div>" +
      '<div class="course-footer">' +
        '<span class="price">' + formatPrice(course.price) + "</span>" +
        '<a href="course-details.html?id=' + course.id + '" class="btn btn-outline btn-sm">View</a>' +
      "</div>" +
    "</div>" +
  "</article>";
}

/* ==========================================================================
   4. SHARED UI
   ========================================================================== */

// Opens and closes the mobile menu
function initMenu() {
  const toggle = $("#menuToggle");
  const links = $("#navLinks");
  if (!toggle || !links) return;

  toggle.addEventListener("click", function () {
    links.classList.toggle("open");
  });
}

// Shows how many items are in the cart, in the navbar
function updateCartCount() {
  const badge = $("#cartCount");
  if (!badge) return;
  badge.textContent = getCart().length;
}

// Puts the current year in the footer automatically
function initYear() {
  const yearEl = $("#year");
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
}

// When logged in, swap the Log in / Sign up buttons for account links
function initAuthNav() {
  const user = getCurrentUser();
  if (!user) return;

  const buttons = $$(".nav-actions .btn");
  if (buttons.length < 2) return;

  buttons[0].textContent = "My learning";
  buttons[0].setAttribute("href", "my-courses.html");

  buttons[1].textContent = user.fullName.split(" ")[0];
  buttons[1].setAttribute("href", "profile.html");
}

/* ----- Tabs: works on course details and my courses ----- */
function initTabs(containerSelector, onChange) {
  const container = $(containerSelector);
  if (!container) return;

  container.addEventListener("click", function (event) {
    const tab = event.target.closest(".tab");
    if (!tab) return;

    // Only one tab is active at a time
    container.querySelectorAll(".tab").forEach(function (item) {
      item.classList.remove("active");
    });
    tab.classList.add("active");

    // If the tab names a panel, show that panel
    const panelName = tab.dataset.tab;
    if (panelName) {
      $$(".tab-panel").forEach(function (panel) {
        panel.classList.remove("active");
      });
      const panel = $("#panel-" + panelName);
      if (panel) panel.classList.add("active");
    }

    // Let the page do something extra (filtering, for example)
    if (onChange) onChange(tab);
  });
}

/* ----- Accordion: works on syllabus and FAQ ----- */
function initAccordion(containerSelector) {
  const container = $(containerSelector);
  if (!container) return;

  container.addEventListener("click", function (event) {
    const head = event.target.closest(".accordion-head");
    if (!head) return;

    const item = head.closest(".accordion-item");
    item.classList.toggle("open");

    // Swap the + for a − so the state is obvious
    const icon = head.querySelector(".accordion-icon");
    if (icon) {
      icon.textContent = item.classList.contains("open") ? "−" : "+";
    }
  });
}

/* ----- Form validation helpers ----- */

// Turn the field red and print the message under it
function showError(inputId, message) {
  const input = $("#" + inputId);
  const errorBox = $("#" + inputId + "Error");
  if (input) input.classList.add("invalid");
  if (errorBox) errorBox.textContent = message;
}

// Clear the red state and the message
function clearError(inputId) {
  const input = $("#" + inputId);
  const errorBox = $("#" + inputId + "Error");
  if (input) input.classList.remove("invalid");
  if (errorBox) errorBox.textContent = "";
}

function clearErrors(ids) {
  ids.forEach(clearError);
  const box = $("#formAlert");
  if (box) box.hidden = true;
}

// Show the message box at the top of a form
function showAlert(message, type) {
  const box = $("#formAlert");
  if (!box) return;
  box.textContent = message;
  box.className = "alert alert-" + type;   // alert-error or alert-success
  box.hidden = false;
  box.scrollIntoView({ block: "nearest" });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return /^[0-9]{10}$/.test(value);
}

// Counts characters as you type, for the bio and message fields
function initCharCount(inputId, countId, limit) {
  const input = $("#" + inputId);
  const counter = $("#" + countId);
  if (!input || !counter) return;

  function update() {
    counter.textContent = input.value.length;
    input.value = input.value.slice(0, limit);
  }

  input.addEventListener("input", update);
  update();
}

/* ==========================================================================
   5. PAGE ROUTER
   Every page has <body data-page="something">.
   We read that value and run only the matching function.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  // These run on all pages
  initMenu();
  updateCartCount();
  initYear();
  initAuthNav();

  // These run only on their own page
  const page = document.body.dataset.page;

  if (page === "home")      initHome();
  if (page === "register")  initRegister();
  if (page === "login")     initLogin();
  if (page === "courses")   initCourses();
  if (page === "details")   initCourseDetails();
  if (page === "cart")      initCart();
  if (page === "checkout")  initCheckout();
  if (page === "payment")   initPayment();
  if (page === "success")   initSuccess();
  if (page === "mycourses") initMyCourses();
  if (page === "profile")   initProfile();
  if (page === "contact")   initContact();
  if (page === "notfound")  initNotFound();
});


/* ==========================================================================
   6. PAGE FUNCTIONS
   ========================================================================== */

/* ----- index.html ----- */
function initHome() {
  const input = $("#heroSearch");
  const button = $("#heroSearchBtn");
  if (!input || !button) return;

  function goToSearch() {
    const term = input.value.trim();
    if (term === "") {
      window.location.href = "courses.html";
    } else {
      window.location.href = "courses.html?search=" + encodeURIComponent(term);
    }
  }

  button.addEventListener("click", goToSearch);
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") goToSearch();
  });
}


/* ----- register.html ----- */
function initRegister() {
  const form = $("#registerForm");
  if (!form) return;

  const toggle = $("#togglePassword");
  const passwordInput = $("#password");

  if (toggle && passwordInput) {
    toggle.addEventListener("click", function () {
      const hidden = passwordInput.type === "password";
      passwordInput.type = hidden ? "text" : "password";
      toggle.textContent = hidden ? "Hide" : "Show";
    });
  }

  form.addEventListener("submit", function (event) {
    // Stop the page reloading, which is what forms do by default
    event.preventDefault();

    const fullName = $("#fullName").value.trim();
    const email = $("#email").value.trim().toLowerCase();
    const phone = $("#phone").value.trim();
    const password = $("#password").value;
    const confirmPassword = $("#confirmPassword").value;
    const role = document.querySelector('input[name="role"]:checked').value;
    const termsAccepted = $("#terms").checked;

    clearErrors(["fullName", "email", "phone", "password", "confirmPassword", "terms"]);

    let isValid = true;

    if (fullName.length < 3) {
      showError("fullName", "Enter your full name (at least 3 characters).");
      isValid = false;
    }
    if (email === "") {
      showError("email", "Email is required.");
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError("email", "Enter a valid email, like you@example.com.");
      isValid = false;
    }
    if (!isValidPhone(phone)) {
      showError("phone", "Enter a 10-digit mobile number.");
      isValid = false;
    }
    if (password.length < 6) {
      showError("password", "Password must be at least 6 characters.");
      isValid = false;
    }
    if (confirmPassword !== password) {
      showError("confirmPassword", "Both passwords must match.");
      isValid = false;
    }
    if (!termsAccepted) {
      showError("terms", "Please accept the terms to continue.");
      isValid = false;
    }

    if (!isValid) return;

    const users = getStorage("users", []);

    const alreadyExists = users.some(function (user) {
      return user.email === email;
    });

    if (alreadyExists) {
      showError("email", "This email is already registered.");
      showAlert("An account with this email exists. Try logging in instead.", "error");
      return;
    }

    users.push({
      id: "u" + Date.now(),
      fullName: fullName,
      email: email,
      phone: phone,
      password: password,        // plain text — see the note at the end
      role: role,
      city: "",
      bio: "",
      joinedOn: new Date().toISOString()
    });

    setStorage("users", users);

    showAlert("Account created. Taking you to the login page…", "success");
    form.reset();

    setTimeout(function () {
      window.location.href = "login.html";
    }, 1200);
  });
}


/* ----- login.html ----- */
function initLogin() {
  const form = $("#loginForm");
  if (!form) return;

  const toggle = $("#togglePassword");
  const passwordInput = $("#password");

  if (toggle && passwordInput) {
    toggle.addEventListener("click", function () {
      const hidden = passwordInput.type === "password";
      passwordInput.type = hidden ? "text" : "password";
      toggle.textContent = hidden ? "Hide" : "Show";
    });
  }

  // Creates a test account and fills the form with it
  const demoBtn = $("#demoLoginBtn");
  if (demoBtn) {
    demoBtn.addEventListener("click", function () {
      const users = getStorage("users", []);
      const exists = users.some(function (u) { return u.email === "demo@skillnova.test"; });

      if (!exists) {
        users.push({
          id: "u-demo",
          fullName: "Demo Student",
          email: "demo@skillnova.test",
          phone: "9876543210",
          password: "demo123",
          role: "student",
          city: "Hyderabad",
          bio: "",
          joinedOn: new Date().toISOString()
        });
        setStorage("users", users);
      }

      $("#email").value = "demo@skillnova.test";
      $("#password").value = "demo123";
      showAlert("Demo details filled in. Press Log in to continue.", "success");
    });
  }

  const forgot = $("#forgotLink");
  if (forgot) {
    forgot.addEventListener("click", function (event) {
      event.preventDefault();
      showAlert("Password reset needs a server, so it isn't part of this demo.", "error");
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = $("#email").value.trim().toLowerCase();
    const password = $("#password").value;

    clearErrors(["email", "password"]);

    let isValid = true;
    if (!isValidEmail(email)) {
      showError("email", "Enter a valid email address.");
      isValid = false;
    }
    if (password === "") {
      showError("password", "Enter your password.");
      isValid = false;
    }
    if (!isValid) return;

    const users = getStorage("users", []);
    const match = users.find(function (user) {
      return user.email === email && user.password === password;
    });

    if (!match) {
      showAlert("That email and password don't match an account.", "error");
      return;
    }

    setStorage("currentUser", match);
    showAlert("Logged in. Loading your courses…", "success");

    setTimeout(function () {
      window.location.href = "my-courses.html";
    }, 900);
  });
}


/* ----- courses.html ----- */
function initCourses() {
  const grid = $("#courseGrid");
  if (!grid) return;

  const searchInput = $("#courseSearch");
  const sortSelect = $("#sortSelect");

  // If we arrived from a search box on another page, fill it in
  const initialSearch = getUrlValue("search");
  if (initialSearch) searchInput.value = initialSearch;

  // Reads the state of every filter control
  function readFilters() {
    const categories = [];
    $$('#categoryFilters input:checked').forEach(function (box) {
      categories.push(box.value);
    });

    const levels = [];
    $$('#levelFilters input:checked').forEach(function (box) {
      levels.push(box.value);
    });

    return {
      search: searchInput.value.trim().toLowerCase(),
      categories: categories,
      levels: levels,
      price: document.querySelector('input[name="price"]:checked').value,
      rating: parseFloat(document.querySelector('input[name="rating"]:checked').value),
      sort: sortSelect.value
    };
  }

  function applyFilters() {
    const f = readFilters();

    let list = COURSES.filter(function (course) {
      // Search matches title, instructor or category
      if (f.search) {
        const haystack = (course.title + " " + course.instructor + " " + course.category).toLowerCase();
        if (!haystack.includes(f.search)) return false;
      }
      if (f.categories.length && !f.categories.includes(course.category)) return false;
      if (f.levels.length && !f.levels.includes(course.level)) return false;

      if (f.price === "free" && course.price !== 0) return false;
      if (f.price === "under1500" && course.price >= 1500) return false;
      if (f.price === "1500plus" && course.price < 1500) return false;

      if (course.rating < f.rating) return false;

      return true;
    });

    // Sorting. slice() first so we never reorder the original array.
    list = list.slice().sort(function (a, b) {
      if (f.sort === "rating")     return b.rating - a.rating;
      if (f.sort === "price-low")  return a.price - b.price;
      if (f.sort === "price-high") return b.price - a.price;
      if (f.sort === "newest")     return new Date(b.createdOn) - new Date(a.createdOn);
      return b.students - a.students;   // "popular"
    });

    render(list);
  }

  function render(list) {
    $("#resultsCount").textContent =
      "Showing " + list.length + " of " + COURSES.length + " courses";

    grid.innerHTML = list.map(courseCardHtml).join("");
    $("#emptyState").hidden = list.length > 0;
  }

  function resetFilters() {
    $$('#categoryFilters input, #levelFilters input').forEach(function (box) {
      box.checked = false;
    });
    document.querySelector('input[name="price"][value="all"]').checked = true;
    document.querySelector('input[name="rating"][value="0"]').checked = true;
    searchInput.value = "";
    applyFilters();
  }

  // Any change to any filter re-runs the list
  $("#filterPanel").addEventListener("change", applyFilters);
  sortSelect.addEventListener("change", applyFilters);
  searchInput.addEventListener("input", applyFilters);

  $("#clearFiltersBtn").addEventListener("click", resetFilters);
  $("#emptyResetBtn").addEventListener("click", resetFilters);

  $("#filterToggle").addEventListener("click", function () {
    $("#filterPanel").classList.toggle("open");
  });

  applyFilters();
}


/* ----- course-details.html ----- */
function initCourseDetails() {
  const wrapper = $("#courseWrapper");
  if (!wrapper) return;

  const course = findCourse(getUrlValue("id"));

  // Bad or missing ?id= in the address bar
  if (!course) {
    $("#notFoundBlock").hidden = false;
    return;
  }

  wrapper.hidden = false;
  document.title = course.title + " — SkillNova";

  // ----- Header -----
  $("#crumbTitle").textContent = course.title;
  $("#detailCategory").textContent = course.category;
  $("#detailTitle").textContent = course.title;
  $("#detailTagline").textContent = course.tagline;
  $("#detailRating").textContent = course.rating + " ★";
  $("#detailReviewCount").textContent = course.reviews.toLocaleString("en-IN") + " reviews";
  $("#detailStudents").textContent = course.students.toLocaleString("en-IN") + " learners";
  $("#detailLevel").textContent = course.level;
  $("#detailInstructor").textContent = course.instructor;

  // ----- Buy card -----
  $("#detailThumb").classList.add(course.thumb);
  $("#detailPrice").textContent = formatPrice(course.price);
  $("#detailDuration").textContent = course.hours + " hours";
  $("#detailLessons").textContent = course.lessons;
  $("#detailLanguage").textContent = course.language;

  // ----- Overview -----
  $("#detailDescription").textContent = course.description;
  $("#learnList").innerHTML = course.learn.map(function (item) {
    return "<li>" + escapeHtml(item) + "</li>";
  }).join("");
  $("#requirementList").innerHTML = course.requirements.map(function (item) {
    return "<li>" + escapeHtml(item) + "</li>";
  }).join("");

  // ----- Syllabus -----
  $("#syllabusAccordion").innerHTML = course.syllabus.map(function (module, index) {
    const lessons = module.lessons.map(function (lesson) {
      return "<li>" + escapeHtml(lesson) + "</li>";
    }).join("");

    return '<div class="accordion-item">' +
      '<button type="button" class="accordion-head">' +
        "<span>" + (index + 1) + ". " + escapeHtml(module.title) + "</span>" +
        '<span class="accordion-icon">+</span>' +
      "</button>" +
      '<div class="accordion-body"><ul class="bullet-list">' + lessons + "</ul></div>" +
    "</div>";
  }).join("");

  initAccordion("#syllabusAccordion");

  $("#expandAllBtn").addEventListener("click", function () {
    const items = $$("#syllabusAccordion .accordion-item");
    const shouldOpen = this.textContent === "Expand all";

    items.forEach(function (item) {
      item.classList.toggle("open", shouldOpen);
      item.querySelector(".accordion-icon").textContent = shouldOpen ? "−" : "+";
    });

    this.textContent = shouldOpen ? "Collapse all" : "Expand all";
  });

  // ----- Instructor -----
  const initials = course.instructor.split(" ").map(function (word) {
    return word[0];
  }).join("");

  $("#instructorAvatar").textContent = initials;
  $("#instructorName").textContent = course.instructor;
  $("#instructorRole").textContent = course.instructorRole;
  $("#instructorRating").textContent = course.rating + " ★ rating";
  $("#instructorStudents").textContent = course.students.toLocaleString("en-IN") + " learners";
  $("#instructorCourses").textContent = course.instructorCourses + " courses";
  $("#instructorBio").textContent = course.instructorBio;

  // ----- Tabs -----
  initTabs("#detailTabs");

  // ----- Reviews -----
  let chosenRating = 0;
  $("#reviewsAverage").textContent = course.rating + " ★";

  $("#starPicker").addEventListener("click", function (event) {
    const star = event.target.closest(".star");
    if (!star) return;

    chosenRating = parseInt(star.dataset.value, 10);

    $$("#starPicker .star").forEach(function (item) {
      item.classList.toggle("filled", parseInt(item.dataset.value, 10) <= chosenRating);
    });
  });

  function renderReviews() {
    const all = getStorage("reviews", {});
    const list = all[course.id] || [];
    const box = $("#reviewList");

    if (list.length === 0) {
      box.innerHTML = '<p class="muted">No reviews on this course yet. Be the first.</p>';
      return;
    }

    box.innerHTML = list.map(function (review) {
      const initials = review.name.split(" ").map(function (w) { return w[0]; }).join("");

      return '<div class="review-item">' +
        '<div class="review-item-head">' +
          '<div class="avatar">' + escapeHtml(initials) + "</div>" +
          "<div>" +
            '<p class="review-item-name">' + escapeHtml(review.name) + "</p>" +
            '<p class="review-stars">' + starString(review.rating) + "</p>" +
          "</div>" +
        "</div>" +
        "<p class=\"muted\">" + escapeHtml(review.text) + "</p>" +
        '<p class="muted small">' + formatDate(review.date) + "</p>" +
      "</div>";
    }).join("");
  }

  $("#submitReviewBtn").addEventListener("click", function () {
    const text = $("#reviewText").value.trim();
    clearErrors(["rating", "reviewText"]);

    let isValid = true;
    if (chosenRating === 0) {
      showError("rating", "Pick a star rating first.");
      isValid = false;
    }
    if (text.length < 10) {
      showError("reviewText", "Write at least 10 characters.");
      isValid = false;
    }
    if (!isValid) return;

    const user = getCurrentUser();
    const all = getStorage("reviews", {});
    if (!all[course.id]) all[course.id] = [];

    all[course.id].unshift({
      name: user ? user.fullName : "Guest learner",
      rating: chosenRating,
      text: text,
      date: new Date().toISOString()
    });

    setStorage("reviews", all);

    $("#reviewText").value = "";
    chosenRating = 0;
    $$("#starPicker .star").forEach(function (s) { s.classList.remove("filled"); });
    renderReviews();
  });

  renderReviews();

  // ----- Related courses -----
  const related = COURSES.filter(function (item) {
    return item.category === course.category && item.id !== course.id;
  }).slice(0, 4);

  $("#relatedList").innerHTML = related.length
    ? related.map(function (item) {
        return '<a href="course-details.html?id=' + item.id + '" class="related-item">' +
          '<div class="related-thumb ' + item.thumb + '"></div>' +
          "<div>" +
            '<p class="related-title">' + escapeHtml(item.title) + "</p>" +
            '<p class="muted small">' + formatPrice(item.price) + "</p>" +
          "</div>" +
        "</a>";
      }).join("")
    : '<p class="muted small">Nothing else in this category yet.</p>';

  // ----- Buy buttons -----
  const cartBtn = $("#addToCartBtn");
  const wishBtn = $("#wishlistBtn");

  function refreshButtons() {
    const owned = getEnrolled().some(function (e) { return e.id === course.id; });
    const inCart = getCart().includes(course.id);
    const saved = getWishlist().includes(course.id);

    if (owned) {
      cartBtn.textContent = "Go to course";
      cartBtn.classList.remove("btn-primary");
      cartBtn.classList.add("btn-accent");
    } else if (inCart) {
      cartBtn.textContent = "Go to cart";
    } else {
      cartBtn.textContent = "Add to cart";
    }

    wishBtn.textContent = saved ? "Saved ✓" : "Save for later";
  }

  cartBtn.addEventListener("click", function () {
    const owned = getEnrolled().some(function (e) { return e.id === course.id; });
    if (owned) {
      window.location.href = "my-courses.html";
      return;
    }
    if (getCart().includes(course.id)) {
      window.location.href = "cart.html";
      return;
    }
    addToCart(course.id);
    refreshButtons();
  });

  wishBtn.addEventListener("click", function () {
    toggleWishlist(course.id);
    refreshButtons();
  });

  refreshButtons();
}


/* ----- cart.html ----- */
function initCart() {
  const listBox = $("#cartList");
  if (!listBox) return;

  function render() {
    const totals = getCartTotals();
    const hasItems = totals.courses.length > 0;

    $("#cartLayout").hidden = !hasItems;
    $("#cartEmpty").hidden = hasItems;

    $("#cartSummaryLine").textContent = hasItems
      ? totals.courses.length + (totals.courses.length === 1 ? " course" : " courses") + " in your cart"
      : "Nothing here yet.";

    if (hasItems) {
      $("#cartItemCount").textContent = totals.courses.length + " items";

      listBox.innerHTML = totals.courses.map(function (course) {
        return '<div class="cart-item">' +
          '<div class="cart-item-thumb ' + course.thumb + '"></div>' +
          "<div>" +
            '<h3 class="cart-item-title">' + escapeHtml(course.title) + "</h3>" +
            '<p class="muted small">' + escapeHtml(course.instructor) + "</p>" +
            '<div class="cart-item-meta">' +
              "<span>" + course.hours + " hours</span>" +
              "<span>" + course.lessons + " lessons</span>" +
              "<span>" + escapeHtml(course.level) + "</span>" +
            "</div>" +
          "</div>" +
          '<div class="cart-item-side">' +
            '<span class="price">' + formatPrice(course.price) + "</span>" +
            '<div class="cart-item-actions">' +
              '<button type="button" class="remove-btn" data-remove="' + course.id + '">Remove</button>' +
              '<button type="button" class="link small" data-save="' + course.id + '">Save for later</button>' +
            "</div>" +
          "</div>" +
        "</div>";
      }).join("");
    }

    renderSummary();
    renderWishlist();
    updateCartCount();
  }

  function renderWishlist() {
    const ids = getWishlist();
    const courses = ids.map(findCourse).filter(Boolean);

    $("#wishlistSection").hidden = courses.length === 0;
    if (courses.length === 0) return;

    $("#wishlistCount").textContent = courses.length + " courses";
    $("#wishlistGrid").innerHTML = courses.map(courseCardHtml).join("");
  }

  // One listener for the whole list instead of one per button.
  // This still works for rows added later — that is why it sits on the parent.
  listBox.addEventListener("click", function (event) {
    const removeBtn = event.target.closest("[data-remove]");
    if (removeBtn) {
      removeFromCart(removeBtn.dataset.remove);
      render();
      return;
    }

    const saveBtn = event.target.closest("[data-save]");
    if (saveBtn) {
      const id = saveBtn.dataset.save;
      if (!getWishlist().includes(id)) toggleWishlist(id);
      removeFromCart(id);
      render();
    }
  });

  $("#clearCartBtn").addEventListener("click", function () {
    if (!confirm("Remove everything from your cart?")) return;
    setStorage("cart", []);
    localStorage.removeItem("coupon");
    render();
  });

  // ----- Coupons -----
  function refreshCouponUi() {
    const coupon = getStorage("coupon", null);
    $("#couponSuccess").hidden = !coupon;
    $("#removeCouponBtn").hidden = !coupon;

    if (coupon) {
      $("#couponSuccess").textContent = coupon.label + " applied.";
      $("#couponInput").value = coupon.label;
    }
  }

  $("#applyCouponBtn").addEventListener("click", function () {
    const code = $("#couponInput").value.trim().toUpperCase();
    clearError("coupon");

    if (code === "") {
      showError("coupon", "Enter a coupon code.");
      return;
    }
    if (!COUPONS[code]) {
      showError("coupon", "That code isn't valid. Try LEARN20.");
      return;
    }

    setStorage("coupon", COUPONS[code]);
    refreshCouponUi();
    render();
  });

  $("#removeCouponBtn").addEventListener("click", function () {
    localStorage.removeItem("coupon");
    $("#couponInput").value = "";
    refreshCouponUi();
    render();
  });

  refreshCouponUi();
  render();
}


/* ----- checkout.html ----- */
function initCheckout() {
  const form = $("#checkoutForm");
  if (!form) return;

  // Nothing in the cart means nothing to check out
  if (getCart().length === 0) {
    $("#checkoutLayout").hidden = true;
    $("#checkoutEmpty").hidden = false;
    return;
  }

  renderSummary();

  // Pre-fill from the logged-in user or from last time
  const user = getCurrentUser();
  const saved = getStorage("billingDetails", null);

  if (user) {
    $("#fullName").value = user.fullName;
    $("#email").value = user.email;
    $("#phone").value = user.phone;
    if (user.city) $("#city").value = user.city;
  }
  if (saved) {
    $("#fullName").value = saved.fullName;
    $("#email").value = saved.email;
    $("#phone").value = saved.phone;
    $("#address").value = saved.address;
    $("#city").value = saved.city;
    $("#state").value = saved.state;
    $("#pincode").value = saved.pincode;
  }

  // Reveal the GST fields only when the box is ticked
  $("#gstToggle").addEventListener("change", function () {
    $("#gstBlock").hidden = !this.checked;
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const details = {
      fullName: $("#fullName").value.trim(),
      email: $("#email").value.trim().toLowerCase(),
      phone: $("#phone").value.trim(),
      address: $("#address").value.trim(),
      city: $("#city").value.trim(),
      state: $("#state").value,
      pincode: $("#pincode").value.trim(),
      gst: null
    };

    clearErrors([
      "fullName", "email", "phone", "address",
      "city", "state", "pincode", "companyName", "gstNumber"
    ]);

    let isValid = true;

    if (details.fullName.length < 3) {
      showError("fullName", "Enter your full name.");
      isValid = false;
    }
    if (!isValidEmail(details.email)) {
      showError("email", "Enter a valid email address.");
      isValid = false;
    }
    if (!isValidPhone(details.phone)) {
      showError("phone", "Enter a 10-digit mobile number.");
      isValid = false;
    }
    if (details.address.length < 6) {
      showError("address", "Enter your street address.");
      isValid = false;
    }
    if (details.city === "") {
      showError("city", "Enter your city.");
      isValid = false;
    }
    if (details.state === "") {
      showError("state", "Choose your state.");
      isValid = false;
    }
    if (!/^[0-9]{6}$/.test(details.pincode)) {
      showError("pincode", "Enter a 6-digit PIN code.");
      isValid = false;
    }

    if ($("#gstToggle").checked) {
      const company = $("#companyName").value.trim();
      const gstin = $("#gstNumber").value.trim().toUpperCase();

      if (company.length < 3) {
        showError("companyName", "Enter the company name.");
        isValid = false;
      }
      if (gstin.length !== 15) {
        showError("gstNumber", "A GSTIN is 15 characters long.");
        isValid = false;
      }
      details.gst = { company: company, number: gstin };
    }

    if (!isValid) {
      showAlert("Some fields need fixing before you can continue.", "error");
      return;
    }

    // Payment needs these, so always store them for the next page
    setStorage("billingDetails", details);

    if (!$("#saveDetails").checked) {
      setStorage("saveBilling", false);
    }

    window.location.href = "payment.html";
  });
}


/* ----- payment.html ----- */
function initPayment() {
  const form = $("#paymentForm");
  if (!form) return;

  const billing = getStorage("billingDetails", null);

  // Guard: need both a cart and billing details to be here
  if (getCart().length === 0 || !billing) {
    $("#paymentLayout").hidden = true;
    $("#paymentEmpty").hidden = false;
    return;
  }

  const totals = renderSummary();

  $("#summaryBilling").innerHTML =
    escapeHtml(billing.fullName) + "<br />" + escapeHtml(billing.email);

  $("#payBtn").textContent = "Pay " + formatPrice(totals.total);

  // Switch the visible panel when the method changes
  $("#methodList").addEventListener("change", function () {
    const method = document.querySelector('input[name="method"]:checked').value;

    $$(".method-panel").forEach(function (panel) {
      panel.classList.remove("active");
    });
    $("#panel-" + method).classList.add("active");
  });

  // Type formatting: add a space every 4 digits
  $("#cardNumber").addEventListener("input", function () {
    const digits = this.value.replace(/\D/g, "").slice(0, 16);
    this.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });

  // Auto-insert the slash in MM/YY
  $("#cardExpiry").addEventListener("input", function () {
    const digits = this.value.replace(/\D/g, "").slice(0, 4);
    this.value = digits.length > 2
      ? digits.slice(0, 2) + "/" + digits.slice(2)
      : digits;
  });

  $("#cardCvv").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 3);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const method = document.querySelector('input[name="method"]:checked').value;
    clearErrors(["cardNumber", "cardName", "cardExpiry", "cardCvv", "upiId", "bankSelect"]);

    let isValid = true;
    let methodLabel = "";
    let lastFour = "";

    if (method === "card") {
      const number = $("#cardNumber").value.replace(/\s/g, "");
      const name = $("#cardName").value.trim();
      const expiry = $("#cardExpiry").value;
      const cvv = $("#cardCvv").value;

      if (number.length !== 16) {
        showError("cardNumber", "A card number has 16 digits.");
        isValid = false;
      }
      if (name.length < 3) {
        showError("cardName", "Enter the name printed on the card.");
        isValid = false;
      }
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) {
        showError("cardExpiry", "Use the MM/YY format.");
        isValid = false;
      } else {
        // Check the card has not already expired
        const parts = expiry.split("/");
        const expiryDate = new Date(2000 + parseInt(parts[1], 10), parseInt(parts[0], 10), 0);
        if (expiryDate < new Date()) {
          showError("cardExpiry", "That date has already passed.");
          isValid = false;
        }
      }
      if (cvv.length !== 3) {
        showError("cardCvv", "The CVV is 3 digits.");
        isValid = false;
      }

      methodLabel = "Card";
      lastFour = number.slice(-4);

    } else if (method === "upi") {
      const upi = $("#upiId").value.trim();
      if (!/^[\w.\-]{3,}@[a-zA-Z]{3,}$/.test(upi)) {
        showError("upiId", "Enter a UPI ID like yourname@bank.");
        isValid = false;
      }
      methodLabel = "UPI";

    } else {
      const bank = $("#bankSelect").value;
      if (bank === "") {
        showError("bankSelect", "Choose your bank.");
        isValid = false;
      }
      methodLabel = "Net banking · " + bank;
    }

    if (!isValid) {
      showAlert("Check the highlighted fields and try again.", "error");
      return;
    }

    // Nothing about the card is ever saved — only the last four digits.
    const finalTotals = getCartTotals();

    const order = {
      id: "SN" + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      email: billing.email,
      name: billing.fullName,
      method: lastFour ? methodLabel + " ending " + lastFour : methodLabel,
      items: finalTotals.courses.map(function (course) {
        return { id: course.id, title: course.title, price: course.price };
      }),
      subtotal: finalTotals.subtotal,
      discount: finalTotals.discount,
      coupon: finalTotals.coupon ? finalTotals.coupon.label : null,
      tax: finalTotals.tax,
      total: finalTotals.total
    };

    // Show the fake gateway for a moment
    $("#processingOverlay").hidden = false;

    setTimeout(function () {
      // Move everything from the cart into enrolled courses
      const enrolled = getEnrolled();

      finalTotals.courses.forEach(function (course) {
        const alreadyThere = enrolled.some(function (e) { return e.id === course.id; });
        if (alreadyThere) return;

        enrolled.push({
          id: course.id,
          enrolledOn: new Date().toISOString(),
          progress: 0,
          totalLessons: course.lessons
        });
      });

      setStorage("enrolled", enrolled);

      const orders = getOrders();
      orders.unshift(order);
      setStorage("orders", orders);
      setStorage("lastOrder", order);

      // Empty the cart, since it has been paid for
      setStorage("cart", []);
      localStorage.removeItem("coupon");

      // Take saved courses off the wishlist if they were just bought
      const boughtIds = order.items.map(function (i) { return i.id; });
      setStorage("wishlist", getWishlist().filter(function (id) {
        return !boughtIds.includes(id);
      }));

      window.location.href = "success.html";
    }, 2200);
  });
}


/* ----- success.html ----- */
function initSuccess() {
  const wrapper = $("#successWrapper");
  if (!wrapper) return;

  const order = getStorage("lastOrder", null);

  if (!order) {
    $("#noOrderBlock").hidden = false;
    return;
  }

  wrapper.hidden = false;

  $("#orderEmail").textContent = order.email;
  $("#orderId").textContent = order.id;
  $("#orderDate").textContent = formatDate(order.date);
  $("#orderMethod").textContent = order.method;
  $("#orderName").textContent = order.name;

  $("#orderItems").innerHTML = order.items.map(function (item) {
    return '<div class="receipt-item">' +
      '<span class="receipt-item-title">' + escapeHtml(item.title) + "</span>" +
      "<span>" + formatPrice(item.price) + "</span>" +
    "</div>";
  }).join("");

  $("#orderSubtotal").textContent = formatPrice(order.subtotal);
  $("#orderTax").textContent = formatPrice(order.tax);
  $("#orderTotal").textContent = formatPrice(order.total);

  if (order.discount > 0) {
    $("#discountRow").hidden = false;
    $("#appliedCouponName").textContent = order.coupon;
    $("#orderDiscount").textContent = "−" + formatPrice(order.discount);
  }

  $("#printBtn").addEventListener("click", function () {
    window.print();
  });
}


/* ----- my-courses.html ----- */
function initMyCourses() {
  const wrapper = $("#dashboardWrapper");
  if (!wrapper) return;

  const user = getCurrentUser();

  if (!user) {
    $("#loginGate").hidden = false;
    return;
  }

  wrapper.hidden = false;

  let activeFilter = "all";

  // Combine the saved progress with the course details
  function buildList() {
    return getEnrolled().map(function (entry) {
      const course = findCourse(entry.id);
      if (!course) return null;

      return {
        course: course,
        progress: entry.progress,
        enrolledOn: entry.enrolledOn
      };
    }).filter(Boolean);
  }

  function render() {
    const all = buildList();

    $("#welcomeHeading").textContent = "Welcome back, " + user.fullName.split(" ")[0];

    const completed = all.filter(function (i) { return i.progress >= 100; });
    const inProgress = all.filter(function (i) { return i.progress < 100; });

    $("#statEnrolled").textContent = all.length;
    $("#statProgress").textContent = inProgress.length;
    $("#statCompleted").textContent = completed.length;
    $("#statHours").textContent = all.reduce(function (sum, i) {
      return sum + i.course.hours;
    }, 0);

    $("#countAll").textContent = all.length;
    $("#countProgress").textContent = inProgress.length;
    $("#countCompleted").textContent = completed.length;

    $("#noCourses").hidden = all.length > 0;
    $("#welcomeSub").textContent = all.length
      ? "Pick up where you left off."
      : "Buy a course to get started.";

    // ----- Resume banner: the least finished course still in progress -----
    const resume = inProgress.slice().sort(function (a, b) {
      return b.progress - a.progress;
    })[0];

    $("#continueSection").hidden = !resume;

    if (resume) {
      $("#continueThumb").className = "continue-thumb " + resume.course.thumb;
      $("#continueCategory").textContent = resume.course.category;
      $("#continueTitle").textContent = resume.course.title;

      const doneLessons = Math.round(resume.course.lessons * resume.progress / 100);
      $("#continueLesson").textContent =
        "Lesson " + (doneLessons + 1) + " of " + resume.course.lessons;

      $("#continueBar").style.width = resume.progress + "%";
      $("#continuePercent").textContent = resume.progress + "% complete";
      $("#continueBtn").dataset.advance = resume.course.id;
    }

    // ----- The grid -----
    let shown = all;
    if (activeFilter === "progress")  shown = inProgress;
    if (activeFilter === "completed") shown = completed;

    const sort = $("#mySortSelect").value;
    shown = shown.slice().sort(function (a, b) {
      if (sort === "progress") return b.progress - a.progress;
      if (sort === "title")    return a.course.title.localeCompare(b.course.title);
      return new Date(b.enrolledOn) - new Date(a.enrolledOn);
    });

    $("#noFilterMatch").hidden = !(all.length > 0 && shown.length === 0);

    $("#enrolledGrid").innerHTML = shown.map(function (item) {
      const done = item.progress >= 100;

      return '<article class="enrolled-card">' +
        '<div class="enrolled-thumb ' + item.course.thumb + '"></div>' +
        '<div class="enrolled-body">' +
          '<span class="status-tag' + (done ? " completed" : "") + '">' +
            (done ? "Completed" : "In progress") +
          "</span>" +
          "<h3>" + escapeHtml(item.course.title) + "</h3>" +
          '<p class="muted small">' + escapeHtml(item.course.instructor) + "</p>" +
          '<div class="progress"><div class="progress-bar" style="width:' + item.progress + '%"></div></div>' +
          '<p class="muted small">' + item.progress + "% complete</p>" +
          '<div class="enrolled-footer">' +
            '<button type="button" class="btn btn-primary btn-block" data-advance="' + item.course.id + '">' +
              (done ? "Review course" : "Continue") +
            "</button>" +
          "</div>" +
        "</div>" +
      "</article>";
    }).join("");

    // ----- Saved courses -----
    const wishCourses = getWishlist().map(findCourse).filter(Boolean);
    $("#wishlistSection").hidden = wishCourses.length === 0;
    if (wishCourses.length) {
      $("#wishlistGrid").innerHTML = wishCourses.map(courseCardHtml).join("");
    }
  }

  // Clicking Continue moves the progress bar along.
  // A real platform would track finished lessons; this fakes it.
  function advance(courseId) {
    const enrolled = getEnrolled();

    enrolled.forEach(function (entry) {
      if (entry.id === courseId) {
        entry.progress = Math.min(100, entry.progress + 10);
      }
    });

    setStorage("enrolled", enrolled);
    render();
  }

  document.addEventListener("click", function (event) {
    const btn = event.target.closest("[data-advance]");
    if (!btn) return;
    event.preventDefault();
    advance(btn.dataset.advance);
  });

  initTabs("#myTabs", function (tab) {
    activeFilter = tab.dataset.filter;
    render();
  });

  $("#mySortSelect").addEventListener("change", render);

  render();
}


/* ----- profile.html ----- */
function initProfile() {
  const wrapper = $("#profileWrapper");
  if (!wrapper) return;

  let user = getCurrentUser();

  if (!user) {
    $("#loginGate").hidden = false;
    return;
  }

  wrapper.hidden = false;

  // Writes the changed user back to both storage keys
  function saveUser(updated) {
    const users = getStorage("users", []);
    const index = users.findIndex(function (u) { return u.id === updated.id; });
    if (index > -1) users[index] = updated;

    setStorage("users", users);
    setStorage("currentUser", updated);
    user = updated;
  }

  function renderCard() {
    const initials = user.fullName.split(" ").map(function (w) { return w[0]; }).join("");

    $("#profileAvatar").textContent = initials;
    $("#profileName").textContent = user.fullName;
    $("#profileEmail").textContent = user.email;
    $("#profileRole").textContent = user.role === "trainer" ? "Trainer" : "Student";
    $("#profileJoined").textContent = formatDate(user.joinedOn);
    $("#profileEnrolled").textContent = getEnrolled().length;

    $("#fullName").value = user.fullName;
    $("#phone").value = user.phone;
    $("#email").value = user.email;
    $("#city").value = user.city || "";
    $("#bio").value = user.bio || "";
    $("#bioCount").textContent = ($("#bio").value || "").length;
  }

  // ----- Side menu swaps panels -----
  $("#profileMenu").addEventListener("click", function (event) {
    const item = event.target.closest(".profile-menu-item");
    if (!item) return;

    $$(".profile-menu-item").forEach(function (button) {
      button.classList.remove("active");
    });
    item.classList.add("active");

    $$(".profile-panel").forEach(function (panel) {
      panel.classList.remove("active");
    });
    $("#panel-" + item.dataset.panel).classList.add("active");
  });

  // ----- Personal details -----
  initCharCount("bio", "bioCount", 200);

  $("#detailsForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const fullName = $("#fullName").value.trim();
    const phone = $("#phone").value.trim();

    clearErrors(["fullName", "phone", "city"]);

    let isValid = true;
    if (fullName.length < 3) {
      showError("fullName", "Enter your full name.");
      isValid = false;
    }
    if (!isValidPhone(phone)) {
      showError("phone", "Enter a 10-digit mobile number.");
      isValid = false;
    }
    if (!isValid) return;

    saveUser(Object.assign({}, user, {
      fullName: fullName,
      phone: phone,
      city: $("#city").value.trim(),
      bio: $("#bio").value.trim()
    }));

    renderCard();
    showAlert("Your details have been saved.", "success");
  });

  $("#resetDetailsBtn").addEventListener("click", renderCard);

  // ----- Password -----
  $("#passwordForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const current = $("#currentPassword").value;
    const next = $("#newPassword").value;
    const confirm = $("#confirmNewPassword").value;

    clearErrors(["currentPassword", "newPassword", "confirmNewPassword"]);

    let isValid = true;
    if (current !== user.password) {
      showError("currentPassword", "That isn't your current password.");
      isValid = false;
    }
    if (next.length < 6) {
      showError("newPassword", "Use at least 6 characters.");
      isValid = false;
    }
    if (next !== confirm) {
      showError("confirmNewPassword", "Both passwords must match.");
      isValid = false;
    }
    if (!isValid) return;

    saveUser(Object.assign({}, user, { password: next }));
    this.reset();
    showAlert("Password updated.", "success");
  });

  // ----- Order history -----
  const orders = getOrders();
  $("#noOrders").hidden = orders.length > 0;

  $("#orderList").innerHTML = orders.map(function (order) {
    return '<div class="order-row">' +
      "<div>" +
        '<p class="order-row-id">' + order.id + "</p>" +
        '<p class="muted small">' + formatDate(order.date) + " · " +
          order.items.length + (order.items.length === 1 ? " course" : " courses") +
        "</p>" +
      "</div>" +
      '<span class="price">' + formatPrice(order.total) + "</span>" +
    "</div>";
  }).join("");

  // ----- Preferences -----
  const prefs = getStorage("prefs", { updates: true, reminders: true, offers: false });
  $("#prefUpdates").checked = prefs.updates;
  $("#prefReminders").checked = prefs.reminders;
  $("#prefOffers").checked = prefs.offers;

  $("#savePrefsBtn").addEventListener("click", function () {
    setStorage("prefs", {
      updates: $("#prefUpdates").checked,
      reminders: $("#prefReminders").checked,
      offers: $("#prefOffers").checked
    });
    showAlert("Preferences saved.", "success");
  });

  // ----- Log out -----
  $("#logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });

  // ----- Delete account -----
  $("#deleteAccountBtn").addEventListener("click", function () {
    clearError("deleteConfirm");

    if ($("#deleteConfirm").value.trim() !== "DELETE") {
      showError("deleteConfirm", "Type DELETE exactly to confirm.");
      return;
    }
    if (!confirm("This removes your account and all your data. Continue?")) return;

    const users = getStorage("users", []).filter(function (u) {
      return u.id !== user.id;
    });

    setStorage("users", users);
    ["currentUser", "enrolled", "orders", "lastOrder", "cart", "wishlist", "coupon", "billingDetails", "prefs"]
      .forEach(function (key) {
        localStorage.removeItem(key);
      });

    window.location.href = "index.html";
  });

  renderCard();
}


/* ----- contact.html ----- */
function initContact() {
  initAccordion("#faqAccordion");

  const form = $("#contactForm");
  if (!form) return;

  initCharCount("message", "messageCount", 600);

  // Pre-fill for a logged-in user
  const user = getCurrentUser();
  if (user) {
    $("#fullName").value = user.fullName;
    $("#email").value = user.email;
    $("#phone").value = user.phone;
  }

  $("#resetContactBtn").addEventListener("click", function () {
    form.reset();
    clearErrors(["fullName", "email", "phone", "topic", "subject", "message"]);
    $("#messageCount").textContent = "0";
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const message = {
      fullName: $("#fullName").value.trim(),
      email: $("#email").value.trim().toLowerCase(),
      phone: $("#phone").value.trim(),
      topic: $("#topic").value,
      subject: $("#subject").value.trim(),
      message: $("#message").value.trim(),
      copyMe: $("#copyMe").checked,
      sentOn: new Date().toISOString()
    };

    clearErrors(["fullName", "email", "phone", "topic", "subject", "message"]);

    let isValid = true;

    if (message.fullName.length < 3) {
      showError("fullName", "Enter your name.");
      isValid = false;
    }
    if (!isValidEmail(message.email)) {
      showError("email", "Enter a valid email address.");
      isValid = false;
    }
    // Phone is optional here, so only check it if something was typed
    if (message.phone !== "" && !isValidPhone(message.phone)) {
      showError("phone", "Enter a 10-digit number, or leave this blank.");
      isValid = false;
    }
    if (message.topic === "") {
      showError("topic", "Choose what this is about.");
      isValid = false;
    }
    if (message.subject.length < 4) {
      showError("subject", "Give your message a short subject.");
      isValid = false;
    }
    if (message.message.length < 20) {
      showError("message", "Tell us a bit more — at least 20 characters.");
      isValid = false;
    }

    if (!isValid) return;

    const messages = getStorage("messages", []);
    messages.unshift(message);
    setStorage("messages", messages);

    form.reset();
    $("#messageCount").textContent = "0";
    showAlert("Message sent. We'll reply within one working day.", "success");
  });
}


/* ----- 404.html ----- */
function initNotFound() {
  const input = $("#notFoundSearch");
  const button = $("#notFoundSearchBtn");

  if (input && button) {
    function goToSearch() {
      const term = input.value.trim();
      window.location.href = term === ""
        ? "courses.html"
        : "courses.html?search=" + encodeURIComponent(term);
    }

    button.addEventListener("click", goToSearch);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") goToSearch();
    });
  }

  const backBtn = $("#goBackBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      history.back();
    });
  }
}
