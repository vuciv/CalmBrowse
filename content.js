function extractKeywords() {
  const pageTitle = document.title;

  let mainContent = "";

  if (window.location.hostname.includes("webmd.com")) {
    const contentElements = document.querySelectorAll(
      ".article-page p, .article-page h1, .article-page h2, .article-page li"
    );
    mainContent = Array.from(contentElements)
      .map((el) => el.textContent)
      .join(" ");
  } else if (window.location.hostname.includes("mayoclinic.org")) {
    const contentElements = document.querySelectorAll(
      ".content p, .content h1, .content h2, .content li"
    );
    mainContent = Array.from(contentElements)
      .map((el) => el.textContent)
      .join(" ");
  } else if (window.location.hostname.includes("healthline.com")) {
    const contentElements = document.querySelectorAll(
      "article p, article h1, article h2, article li"
    );
    mainContent = Array.from(contentElements)
      .map((el) => el.textContent)
      .join(" ");
  } else if (window.location.hostname.includes("cancer.org")) {
    const contentElements = document.querySelectorAll(
      "main p, main h1, main h2, main h3, main li, .content-area p, .content-area li"
    );
    mainContent = Array.from(contentElements)
      .map((el) => el.textContent)
      .join(" ");
  }

  if (!mainContent || mainContent.length < 100) {
    const allTextNodes = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const visibleTextNodes = [];
    let currentNode;

    while ((currentNode = allTextNodes.nextNode())) {
      if (currentNode.textContent.trim().length > 0) {
        const element = currentNode.parentElement;
        const style = window.getComputedStyle(element);
        if (style.display !== "none" && style.visibility !== "hidden") {
          visibleTextNodes.push(currentNode.textContent);
        }
      }
    }

    mainContent = visibleTextNodes.join(" ");
  }

  const commonMedicalTerms = [
    "headache",
    "migraine",
    "pain",
    "cancer",
    "tumor",
    "disease",
    "syndrome",
    "infection",
    "chronic",
    "acute",
    "symptom",
    "treatment",
    "diagnosis",
    "heart attack",
    "stroke",
    "chest pain",
    "fatigue",
    "anxiety",
    "depression",
    "lymph",
    "nodes",
    "lump",
    "weight loss",
    "fever",
    "bleeding",
    "blood",
    "cough",
    "swelling",
    "lesion",
    "disorder",
    "condition",
    "screening",
    "prognosis",
    "malignant",
    "benign",
    "carcinoma",
    "metastasis",
    "biopsy",
    "radiation",
    "chemotherapy",
    "leukemia",
    "lymphoma",
    "melanoma",
    "sarcoma",
  ];

  let extractedKeywords = [];

  const fullText = (pageTitle + " " + mainContent).toLowerCase();

  commonMedicalTerms.forEach((term) => {
    if (fullText.includes(term)) {
      extractedKeywords.push(term);
    }
  });

  if (window.location.hostname.includes("cancer.org")) {
    if (!extractedKeywords.includes("cancer")) {
      extractedKeywords.push("cancer");
    }
  }

  return {
    pageTitle,
    keywords: extractedKeywords,
  };
}

function createPerspectivePanel(contextData) {
  if (document.getElementById("calmbrowse-host")) {
    return;
  }

  const backdropElement = document.createElement("div");
  backdropElement.id = "calmbrowse-backdrop";
  backdropElement.style.position = "fixed";
  backdropElement.style.top = "0";
  backdropElement.style.left = "0";
  backdropElement.style.width = "100%";
  backdropElement.style.height = "100%";
  backdropElement.style.backgroundColor = "rgba(0, 0, 0, 0.15)";
  backdropElement.style.zIndex = "2147483646";
  backdropElement.style.display = "flex";
  backdropElement.style.justifyContent = "center";
  backdropElement.style.alignItems = "flex-start";
  backdropElement.style.paddingTop = "40px";
  backdropElement.style.pointerEvents = "none";

  document.body.appendChild(backdropElement);

  const hostElement = document.createElement("div");
  hostElement.id = "calmbrowse-host";
  hostElement.style.position = "fixed";
  hostElement.style.top = "20px";
  hostElement.style.right = "20px";
  hostElement.style.zIndex = "2147483647";
  hostElement.style.pointerEvents = "auto";
  hostElement.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";

  document.body.appendChild(hostElement);

  const shadow = hostElement.attachShadow({ mode: "open" });

  const panel = document.createElement("div");
  panel.className = "perspective-panel";

  panel.innerHTML = `
    <div class="panel-header">
      <h3>CalmBrowse Perspective</h3>
      <button class="close-btn">&times;</button>
    </div>
    <div class="panel-content">
      ${
        contextData.reframe
          ? `
        <div class="reframe-section">
          <h4>Hi, there.</h4>
          <p>${contextData.reframe}</p>
        </div>
      `
          : ""
      }
      
      ${
        contextData.commonBenignCauses
          ? `
        <div class="benign-causes-section">
          <h4>Common Benign Causes</h4>
          <p>${contextData.commonBenignCauses}</p>
        </div>
      `
          : ""
      }
      
      ${
        contextData.prevalence
          ? `
        <div class="context-section">
          <h4>Additional Context</h4>
          <p>${contextData.prevalence}</p>
          ${contextData.context ? `<p>${contextData.context}</p>` : ""}
        </div>
      `
          : ""
      }
      
      ${
        contextData.calmingSuggestion
          ? `
        <div class="calming-section">
          <h4>Calming Technique</h4>
          <p>${contextData.calmingSuggestion}</p>
        </div>
      `
          : ""
      }
      
      <div class="trusted-sources">
        <h4>Trusted Medical Resources</h4>
        <ul>
          ${contextData.trustedSources
            .map(
              (source) =>
                `<li><a href="${source.url}" target="_blank">${source.name}</a></li>`
            )
            .join("")}
        </ul>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .perspective-panel {
      width: 350px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      font-family: Arial, sans-serif;
      transition: transform 0.3s ease-in-out;
      overflow: hidden;
      border: 1px solid #d0d0d0;
    }
    
    .panel-header {
      background-color: #3498db;
      color: white;
      padding: 12px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 22px;
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    
    .close-btn:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .panel-content {
      padding: 15px;
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .panel-content h4 {
      margin-top: 0;
      color: #333;
      font-size: 16px;
      margin-bottom: 8px;
    }
    
    .condition-section {
      margin: 0 0 10px 0;
      padding: 8px 12px;
      background-color: #f8f9fa;
      border-left: 3px solid #e74c3c;
      line-height: 1.5;
    }
    
    .reframe-section {
      margin: 15px 0;
      padding: 12px;
      background-color: #f8f9fa;
      border-left: 3px solid #2ecc71;
      line-height: 1.5;
    }
    
    .benign-causes-section {
      margin: 15px 0;
      padding: 12px;
      background-color: #f5f5f5;
      border-left: 3px solid #9b59b6;
      line-height: 1.5;
    }
    
    .context-section {
      margin: 15px 0;
      padding: 12px;
      background-color: #f8f9fa;
      border-left: 3px solid #f39c12;
      line-height: 1.5;
    }
    
    .calming-section {
      margin: 15px 0;
      padding: 12px;
      background-color: #e8f4fc;
      border-left: 3px solid #3498db;
      line-height: 1.5;
    }
    
    .trusted-sources {
      margin-top: 15px;
    }
    
    .trusted-sources ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .trusted-sources a {
      color: #3498db;
      text-decoration: none;
      padding: 3px 0;
      display: inline-block;
    }
    
    .trusted-sources a:hover {
      text-decoration: underline;
    }
    
    .panel-hidden {
      transform: translateX(350px);
    }
  `;

  shadow.appendChild(style);
  shadow.appendChild(panel);

  const closeBtn = shadow.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    panel.classList.add("panel-hidden");
    backdropElement.style.opacity = "0";
    backdropElement.style.transition = "opacity 0.3s ease-in-out";

    setTimeout(() => {
      document.body.removeChild(hostElement);
      document.body.removeChild(backdropElement);
    }, 300);
  });

  panel.classList.add("panel-hidden");

  backdropElement.style.opacity = "0";
  backdropElement.style.transition = "opacity 0.3s ease-in-out";

  requestAnimationFrame(() => {
    panel.classList.remove("panel-hidden");
    backdropElement.style.opacity = "1";
  });
}

function initPerspectivePanel() {
  const { pageTitle, keywords, pageContent } = extractPageContent();

  if (keywords.length > 0 || isHealthWebsite()) {
    chrome.runtime.sendMessage(
      {
        action: "getContextData",
        pageTitle: pageTitle,
        keywords: keywords,
        pageContent: pageContent,
        url: window.location.href,
      },
      (response) => {
        if (response) {
          const contextData = {
            ...response,
            trustedSources: [
              { name: "Mayo Clinic", url: "https://www.mayoclinic.org/" },
              {
                name: "National Institutes of Health",
                url: "https://www.nih.gov/",
              },
              {
                name: "Centers for Disease Control",
                url: "https://www.cdc.gov/",
              },
            ],
          };

          createPerspectivePanel(contextData);
        }
      }
    );
  }
}

function extractPageContent() {
  const pageTitle = document.title;

  let mainContent = "";

  try {
    if (window.location.hostname.includes("webmd.com")) {
      const article = document.querySelector(".article-page");
      if (article) mainContent = article.innerText;
    } else if (window.location.hostname.includes("mayoclinic.org")) {
      const content = document.querySelector(".content, .main-content");
      if (content) mainContent = content.innerText;
    } else if (window.location.hostname.includes("healthline.com")) {
      const article = document.querySelector("article");
      if (article) mainContent = article.innerText;
    } else if (window.location.hostname.includes("cancer.org")) {
      const main = document.querySelector("main, .content-area");
      if (main) mainContent = main.innerText;
    }

    if (!mainContent || mainContent.length < 100) {
      mainContent = getVisibleText(document.body);
    }
  } catch (e) {
    console.error("Error extracting page content:", e);

    mainContent = getVisibleText(document.body);
  }

  const extractedKeywords = extractKeywords(pageTitle, mainContent);

  return {
    pageTitle,
    keywords: extractedKeywords,
    pageContent: mainContent,
  };
}

function getVisibleText(element) {
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return "";
  }

  const tagName = element.tagName.toLowerCase();
  if (["script", "style", "noscript", "iframe", "svg"].includes(tagName)) {
    return "";
  }

  if (element.nodeType === Node.TEXT_NODE) {
    return element.textContent.trim();
  }

  if (
    ["nav", "footer", "header", "menu"].includes(tagName) ||
    (element.id &&
      (element.id.toLowerCase().includes("nav") ||
        element.id.toLowerCase().includes("menu") ||
        element.id.toLowerCase().includes("footer"))) ||
    (element.className &&
      typeof element.className === "string" &&
      (element.className.toLowerCase().includes("nav") ||
        element.className.toLowerCase().includes("menu") ||
        element.className.toLowerCase().includes("footer")))
  ) {
    return "";
  }

  let result = "";
  for (const child of element.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      result += " " + getVisibleText(child);
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent.trim();
      if (text) result += " " + text;
    }
  }

  return result.trim().replace(/\s+/g, " ");
}

function extractKeywords(pageTitle, content) {
  const commonMedicalTerms = [
    "headache",
    "migraine",
    "pain",
    "cancer",
    "tumor",
    "disease",
    "syndrome",
    "infection",
    "chronic",
    "acute",
    "symptom",
    "treatment",
    "diagnosis",
    "heart attack",
    "stroke",
    "chest pain",
    "fatigue",
    "anxiety",
    "depression",
    "lymph",
    "nodes",
    "lump",
    "weight loss",
    "fever",
    "bleeding",
    "blood",
    "cough",
    "swelling",
    "lesion",
    "disorder",
    "condition",
    "screening",
    "prognosis",
    "malignant",
    "benign",
    "carcinoma",
    "metastasis",
    "biopsy",
    "radiation",
    "chemotherapy",
    "leukemia",
    "lymphoma",
    "melanoma",
    "sarcoma",
  ];

  let extractedKeywords = [];

  const fullText = (pageTitle + " " + content).toLowerCase();

  commonMedicalTerms.forEach((term) => {
    if (fullText.includes(term)) {
      extractedKeywords.push(term);
    }
  });

  if (window.location.hostname.includes("cancer.org")) {
    if (!extractedKeywords.includes("cancer")) {
      extractedKeywords.push("cancer");
    }
  }

  return extractedKeywords;
}

function isHealthWebsite() {
  const healthDomains = [
    "webmd.com",
    "mayoclinic.org",
    "healthline.com",
    "medicinenet.com",
    "cancer.org",
    "cancer.gov",
    "nih.gov",
    "cdc.gov",
    "who.int",
    "health.com",
    "everydayhealth.com",
  ];

  const hostname = window.location.hostname;
  return healthDomains.some((domain) => hostname.includes(domain));
}

let hasInitialized = false;

function checkPageReady() {
  if (hasInitialized) return;

  if (
    window.location.hostname.includes("webmd.com") &&
    document.querySelectorAll(".article-page p").length < 3
  ) {
    return false;
  }

  if (
    window.location.hostname.includes("mayoclinic.org") &&
    document.querySelectorAll(".content p").length < 3
  ) {
    return false;
  }

  if (
    window.location.hostname.includes("healthline.com") &&
    document.querySelectorAll("article p").length < 3
  ) {
    return false;
  }

  if (
    window.location.hostname.includes("cancer.org") &&
    document.querySelectorAll("main p, .content-area p").length < 2
  ) {
    return false;
  }

  hasInitialized = true;
  initPerspectivePanel();
  return true;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => checkPageReady());
} else {
  checkPageReady();
}

const observer = new MutationObserver((mutations, obs) => {
  if (!hasInitialized && checkPageReady()) {
    obs.disconnect();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});

setTimeout(() => {
  if (!hasInitialized) {
    checkPageReady();
  }
}, 200);
