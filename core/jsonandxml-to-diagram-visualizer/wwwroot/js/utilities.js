// JSON/XML Diagram Visualizer - Utility Functions

// Access global theme settings
var currentThemeSettings = window.currentThemeSettings || {};

// SEARCH FUNCTIONALITY FUNCTIONS
function searchNodes(searchQuery) {
    // Reset zoom
    jsonXmlDiagram.reset();

    // Remove any old Enter key handler
    if (globalSearchEnterKeyHandler) {
        document.removeEventListener("keydown", globalSearchEnterKeyHandler);
        globalSearchEnterKeyHandler = null;
    }

    // Clear all node styles first
    resetAllNodeStyles();

    // If query is empty, clear counter and return
    if (!searchQuery) {
        updateSearchCounter(0, 0);
        return;
    }

    // Process the search query
    processSearchQuery(searchQuery);
}

// Process search query and find matches
function processSearchQuery(searchQuery) {
    const searchMatches = [];
    jsonXmlDiagram.nodes.forEach((diagramNode) => {
        const nodeDataString = ("" + (diagramNode.data.actualdata || "")).toLowerCase();
        if (nodeDataString.includes(searchQuery)) {
            searchMatches.push(diagramNode.id);
        }
    });

    let currentMatchIndex = 0;
    const focusCurrentMatch = () => {
        searchMatches.forEach((matchedNodeId, matchIndex) => {
            const matchedNodeElement = document.getElementById(matchedNodeId + "_content");
            if (!matchedNodeElement) return;

            if (matchIndex === currentMatchIndex) {
                matchedNodeElement.style.fill = currentThemeSettings.highlightFocusColor;
                matchedNodeElement.style.stroke = currentThemeSettings.highlightStrokeColor;
                matchedNodeElement.style.strokeWidth = 2;
                jsonXmlDiagram.bringToCenter(jsonXmlDiagram.getObject(matchedNodeId).wrapper.bounds);
            } else {
                matchedNodeElement.style.fill = currentThemeSettings.highlightFillColor;
                matchedNodeElement.style.stroke = currentThemeSettings.highlightStrokeColor;
                matchedNodeElement.style.strokeWidth = 1.5;
            }
        });
    };

    if (searchMatches.length > 0) {
        focusCurrentMatch();
        updateSearchCounter(1, searchMatches.length);

        const enterKeyHandler = (keyboardEvent) => {
            if (keyboardEvent.key === "Enter") {
                currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
                focusCurrentMatch();
                updateSearchCounter(currentMatchIndex + 1, searchMatches.length);
            }
        };
        globalSearchEnterKeyHandler = enterKeyHandler;
        document.addEventListener("keydown", enterKeyHandler);
    } else {
        updateSearchCounter(0, 0);
    }
}

// Reset all node styles to default
function resetAllNodeStyles() {
    jsonXmlDiagram.nodes.forEach((diagramNode) => {
        const nodeElement = document.getElementById(diagramNode.id + "_content");
        if (nodeElement) {
            nodeElement.style.stroke = currentThemeSettings.nodeStrokeColor;
            nodeElement.style.fill = currentThemeSettings.nodeFillColor;
            nodeElement.style.strokeWidth = 1.5;
        }
    });
}

// Update search counter display
function updateSearchCounter(currentMatchNumber, totalMatchesCount) {
    const searchCounterElement = document.querySelector(".search-counter");
    const searchInput = document.getElementById('toolbar-search');
    if (searchCounterElement) {
        searchCounterElement.textContent = `${currentMatchNumber} / ${totalMatchesCount}`;
        searchCounterElement.style.display = searchInput.value.trim() ? "flex" : "none";
    }
}

// THEME MANAGEMENT FUNCTIONS
function setTheme(themeName) {
    // Don't update if it's the same theme
    if (currentThemeSettings && currentThemeSettings.theme === themeName) {
        return;
    }

    currentThemeSettings = getThemeSettings(themeName);
    window.currentThemeSettings = currentThemeSettings;

    // Update Monaco editor theme
    if (monacoEditor) {
        monaco.editor.setTheme(themeName === "dark" ? "vs-dark" : "vs");
    }

    // Update body class
    document.body.classList.toggle("dark-theme", themeName === "dark");

    // Update diagram elements
    updateDiagramTheme();

    // Clear search highlighting
    clearSearchInput();
}

function getThemeSettings(theme) {
    if (theme === "dark") {
        return {
            theme: 'dark',
            themeUrl: "https://cdn.syncfusion.com/ej2/29.1.33/tailwind-dark.css",
            diagramBackgroundColor: "#1e1e1e",
            gridlinesColor: "rgb(45, 45, 45)",
            nodeFillColor: "rgb(41, 41, 41)",
            nodeStrokeColor: "rgb(66, 66, 66)",
            textKeyColor: "#4dabf7",
            textValueColor: "rgb(207, 227, 225)",
            textValueNullColor: "rgb(151, 150, 149)",
            expandIconFillColor: "#1e1e1e",
            expandIconColor: "rgb(220, 221, 222)",
            expandIconBorder: "rgb(66, 66, 66)",
            connectorStrokeColor: "rgb(66, 66, 66)",
            childCountColor: "rgb(255, 255, 255)",
            booleanColor: "rgb(61, 226, 49)",
            numericColor: "rgb(232, 196, 121)",
            popupKeyColor: "#A5D8FF",
            popupValueColor: "#40C057",
            popupContentBGColor: "#1A1A1A",
            highlightFillColor: "rgba(27, 255, 0, 0.1)",
            highlightFocusColor: "rgba(82, 102, 0, 0.61)",
            highlightStrokeColor: "rgb(0, 135, 54)"
        };
    } else {
        return {
            theme: 'light',
            themeUrl: "https://cdn.syncfusion.com/ej2/29.1.33/tailwind.css",
            diagramBackgroundColor: "#F8F9FA",
            gridlinesColor: "#EBE8E8",
            nodeFillColor: "rgb(255, 255, 255)",
            nodeStrokeColor: "rgb(188, 190, 192)",
            textKeyColor: "#A020F0",
            textValueColor: "rgb(83, 83, 83)",
            textValueNullColor: "rgb(41, 41, 41)",
            expandIconFillColor: "#e0dede",
            expandIconColor: "rgb(46, 51, 56)",
            expandIconBorder: "rgb(188, 190, 192)",
            connectorStrokeColor: "rgb(188, 190, 192)",
            childCountColor: "rgb(41, 41, 41)",
            booleanColor: "rgb(74, 145, 67)",
            numericColor: "rgb(182, 60, 30)",
            popupKeyColor: "#5C940D",
            popupValueColor: "#1864AB",
            popupContentBGColor: "#F8F9FA",
            highlightFillColor: "rgba(27, 255, 0, 0.1)",
            highlightFocusColor: "rgba(252, 255, 166, 0.57)",
            highlightStrokeColor: "rgb(0, 135, 54)"
        };
    }
}

function updateDiagramTheme() {
    if (jsonXmlDiagram) {
        jsonXmlDiagram.backgroundColor = currentThemeSettings.diagramBackgroundColor;
        jsonXmlDiagram.snapSettings.verticalGridlines.lineColor =
            currentThemeSettings.theme === "dark" ? "rgb(45, 45, 45)" : "#EBE8E8";
        jsonXmlDiagram.snapSettings.horizontalGridlines.lineColor =
            currentThemeSettings.theme === "dark" ? "rgb(45, 45, 45)" : "#EBE8E8";

        jsonXmlDiagram.refresh();
        jsonXmlDiagram.fitToPage({ mode: "Page", region: "Content", canZoomIn: true });
    }

    // update cdn links
    const themeStylesheetLink = document.getElementById("theme-link");
    if (themeStylesheetLink) {
        themeStylesheetLink.href = currentThemeSettings.themeUrl;
    }
}

// LAYOUT MANIPULATION FUNCTIONS
function rotateLayout() {
    currentOrientationIndex = (currentOrientationIndex + 1) % orientations.length;
    currentOrientation = orientations[currentOrientationIndex];
    jsonXmlDiagram.layout.orientation = currentOrientation;

    jsonXmlDiagram.nodes.forEach((diagramNode) => {
        updateExpandCollapseIconOffset(diagramNode);
    });

    jsonXmlDiagram.dataBind();
    jsonXmlDiagram.fitToPage({ mode: "Page", region: "Content", canZoomIn: true });
}

function toggleCollapseGraph() {
    const allDiagramNodes = jsonXmlDiagram.nodes;

    if (isGraphCollapsed) {
        // Expand all nodes
        allDiagramNodes.forEach((diagramNode) => {
            if (diagramNode.isExpanded === false) {
                diagramNode.isExpanded = true;
            }
        });
        isGraphCollapsed = false;
    } else {
        // Collapse root nodes
        allDiagramNodes.forEach((diagramNode) => {
            if (!diagramNode.inEdges || diagramNode.inEdges.length === 0) {
                if (!diagramNode.expandIcon || diagramNode.expandIcon.shape === "None") {
                    diagramNode.outEdges.forEach((outgoingEdgeId) => {
                        const connectorEdge = jsonXmlDiagram.connectors.find(
                            (connector) => connector.id === outgoingEdgeId
                        );
                        if (connectorEdge) {
                            const targetNode = allDiagramNodes.find(
                                (node) => node.id === connectorEdge.targetID
                            );
                            if (targetNode) {
                                targetNode.isExpanded = false;
                            }
                        }
                    });
                } else {
                    diagramNode.isExpanded = false;
                }
            }
        });
        isGraphCollapsed = true;
    }
    updateCollapseMenuText();
}

function updateCollapseMenuText() {
    const hamburgerMenuButton = document.getElementById('hamburger-menu').ej2_instances[0];
    
    // Find the collapse graph menu item and update its text and icon
    const updatedItems = hamburgerMenuButton.items.map(item => {
        if (item.id === 'collapseGraph') {
            return {
                ...item,
                text: isGraphCollapsed ? 'Expand Graph' : 'Collapse Graph',
                iconCss: isGraphCollapsed ? 'e-icons e-expand' : 'e-icons e-collapse-2'
            };
        }
        return item;
    });
    
    // Update the dropdown items
    hamburgerMenuButton.setProperties({items: updatedItems}, true);
}

function toggleGrid() {
    if (jsonXmlDiagram.snapSettings.constraints & ej.diagrams.SnapConstraints.ShowLines) {
        jsonXmlDiagram.snapSettings.constraints &= ~ej.diagrams.SnapConstraints.ShowLines;
    } else {
        jsonXmlDiagram.snapSettings.constraints |= ej.diagrams.SnapConstraints.ShowLines;
    }
}

// FILE OPERATIONS
function importFile() {
    const fileInput = document.getElementById('file-input');
    
    // Set accept attribute based on current editor input type
    const acceptType = currentEditorInputType.toLowerCase() === 'json' ? '.json' : '.xml';
    fileInput.accept = acceptType;
    
    fileInput.onchange = function (event) {
        const file = event.target.files[0];
        if (file) {
            // Validate file extension matches current editor type
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            const expectedExtension = currentEditorInputType.toLowerCase() === 'json' ? '.json' : '.xml';
            
            if (fileExtension !== expectedExtension) {
                alert(`Please select a ${expectedExtension.toUpperCase()} file. Current editor type is ${currentEditorInputType}.`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function (e) {
                const content = e.target.result;
                if (monacoEditor) {
                    monacoEditor.setValue(content);
                }
            };
            reader.readAsText(file);
        }
    };
    fileInput.click();
}

function exportFile() {
    if (monacoEditor) {
        const content = monacoEditor.getValue();
        const extension = currentEditorInputType.toLowerCase();
        const filename = `diagram.${extension}`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// TOOLBAR FUNCTIONS
function initializeSearchBox() {
    const searchInput = document.getElementById('toolbar-search'); if (searchInput && searchInput.ej2_instances && searchInput.ej2_instances[0]) { const searchTextBox = searchInput.ej2_instances[0];

    // Add search icon to input field
    searchTextBox.addIcon('prepend', 'e-icons e-search search-icon');
    
    // Create counter element for search results display
    const searchResultCounter = document.createElement('span');
    searchResultCounter.style.fontSize = '.75rem';
    searchResultCounter.className = 'e-input-group-icon counter-icon search-counter';
    searchResultCounter.style.display = 'none';
    
    // Append counter to the input group
    const inputGroup = document.querySelector('.search-container .e-input-group');
    if (inputGroup) {
        inputGroup.appendChild(searchResultCounter);
    }
}
}


// EXPORT DIALOG FUNCTIONS
function showExportDialog() {
    const exportDialog = document.getElementById('export-dialog');
    if (exportDialog && exportDialog.ej2_instances && exportDialog.ej2_instances[0]) {
        exportDialog.ej2_instances[0].show();
    }
}

function handleExportConfirm() {
    const filenameInput = document.getElementById('export-filename');
    const selectedFormat = getSelectedExportFormat();

    if (filenameInput && jsonXmlDiagram) {
        const filename = filenameInput.ej2_instances[0].value || 'Diagram';
        const format = selectedFormat || 'PNG';

        jsonXmlDiagram.exportDiagram({
            fileName: filename,
            format: format,
            region: 'Content'
        });
    }

    handleExportDialogClose();
}

function getSelectedExportFormat() {
    const pngRadio = document.getElementById('export-mode-png');
    const jpgRadio = document.getElementById('export-mode-jpg');
    const svgRadio = document.getElementById('export-mode-svg');

    if (pngRadio && pngRadio.ej2_instances && pngRadio.ej2_instances[0].checked) return 'PNG';
    if (jpgRadio && jpgRadio.ej2_instances && jpgRadio.ej2_instances[0].checked) return 'JPG';
    if (svgRadio && svgRadio.ej2_instances && svgRadio.ej2_instances[0].checked) return 'SVG';
    
    return 'PNG'; // default
}


function handleExportDialogClose() {
    const exportDialog = document.getElementById('export-dialog');
    if (exportDialog && exportDialog.ej2_instances && exportDialog.ej2_instances[0]) {
        exportDialog.ej2_instances[0].hide();
    }
}


// NODE DETAILS DIALOG FUNCTIONS
let nodeDetailsDialog = null;
let currentNodeRawContent = '';

function initializeNodeDetailsDialog() {
    nodeDetailsDialog = ej.base.getComponent(document.getElementById('node-details-dialog'), 'dialog');
    nodeDetailsDialog.animationSettings = { effect: 'Zoom' };
}

function handleNodeDetailsClose() {
    nodeDetailsDialog.hide();
}

function showNodeDetails(content, path) {
    if (!nodeDetailsDialog) {
        initializeNodeDetailsDialog();
    }

    currentNodeRawContent = content;
    document.getElementById('ndd-content').innerHTML = buildContentHtml(content);
    document.getElementById('ndd-path').innerHTML = buildPathHtml(path);
    nodeDetailsDialog.show();
}

function buildContentHtml(rawContentData) {
    const parsedJsonLines = formatJsonLines(rawContentData);
    let generatedHtml = `<div style="padding:10px; overflow-x:auto; font-family:Consolas; font-size:14px;">`;

    if (parsedJsonLines.length === 0) {
        // Use theme color for values
        generatedHtml += `<div style="color:${currentThemeSettings.popupValueColor};">"${rawContentData.trim()}"</div>`;
    } else {
        generatedHtml += `<div>{</div>`;
        parsedJsonLines.forEach(({ key, value, hasComma }) => {
            generatedHtml += `
                    <div style="line-height:16px;">
                        <span style="color:${currentThemeSettings.popupKeyColor}; font-weight:550; margin-left:14px;">${key}</span>
                        <span style="margin-right:3px; color:${currentThemeSettings.popupValueColor};">:</span>
                        <span style="color:${currentThemeSettings.popupValueColor};">${value}</span>${hasComma ? ',' : ''}
                    </div>`;
        });
        generatedHtml += `<div>}</div>`;
    }

    generatedHtml += `</div>`;
    return generatedHtml;
}

function buildPathHtml(rawJsonPath) {
    const formattedPath = rawJsonPath.startsWith('Root') ? `{Root}${rawJsonPath.slice(4)}` : rawJsonPath;
    return `<div style="padding:10px; overflow-x:auto; font-family:Consolas; font-size:14px;">${formattedPath}</div>`;
}

function formatJsonLines(inputContent) {
    if (!inputContent || !inputContent.trim()) return [];
    const contentLines = inputContent.split('\n');
    const formattedJsonLines = [];

    contentLines.forEach((currentLine, lineIndex) => {
        const colonIndex = currentLine.indexOf(':');
        if (colonIndex < 0) return;
        const extractedKey = currentLine.slice(0, colonIndex).trim();
        let extractedValue = currentLine.slice(colonIndex + 1).trim();
        let processedValue;

        if (/^(true|false)$/i.test(extractedValue)) processedValue = extractedValue.toLowerCase();
        else if (!isNaN(parseFloat(extractedValue))) processedValue = extractedValue;
        else processedValue = `"${extractedValue.replace(/^"(.*)"$/, '$1')}"`;

        const isLastLine = lineIndex === contentLines.length - 1;
        formattedJsonLines.push({
            key: `"${extractedKey}"`,
            value: processedValue,
            hasComma: !isLastLine
        });
    });

    return formattedJsonLines;
}


// Handle copy button clicks
document.addEventListener('click', function (clickEvent) {
    if (clickEvent.target.closest('#ndd-copy-content')) {
        const formattedJsonContent = getFormattedJsonString(currentNodeRawContent);
        navigator.clipboard.writeText(formattedJsonContent);
        const copyIconElement = clickEvent.target.closest('button').querySelector('.e-icons');
        copyIconElement.classList.replace('e-copy', 'e-check');
        setTimeout(() => copyIconElement.classList.replace('e-check', 'e-copy'), 1500);
    }

    if (clickEvent.target.closest('#ndd-copy-path')) {
        const pathTextContent = document.getElementById('ndd-path').textContent;
        navigator.clipboard.writeText(pathTextContent);
        const pathCopyIconElement = clickEvent.target.closest('button').querySelector('.e-icons');
        pathCopyIconElement.classList.replace('e-copy', 'e-check');
        setTimeout(() => pathCopyIconElement.classList.replace('e-check', 'e-copy'), 1500);
    }
});

function getFormattedJsonString(rawContentInput) {
    const parsedContentLines = formatJsonLines(rawContentInput);
    if (parsedContentLines.length === 0) return `"${rawContentInput.trim()}"`;
    let formattedJsonResult = '{\n';
    parsedContentLines.forEach(({ key, value, hasComma }) => {
        formattedJsonResult += `    ${key}: ${value}${hasComma ? ',' : ''}\n`;
    });
    formattedJsonResult += '}';
    return formattedJsonResult;
}

function handleNodeDetailsOverlayClick() {
    nodeDetailsDialog.hide();
}