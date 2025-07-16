// Diagram Node Defaults and Styling Functions for JSON/XML Visualizer

// Calculate text width for proper node sizing
function getTextWidth(text, font) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;
    return context.measureText(text).width;
}

// Define default styling and behavior for diagram nodes
function getNodeDefaults(node) {
    const isLeafNode = node.additionalInfo && node.additionalInfo.isLeaf === true;
    const isMainRootNode = node?.id === "main-root";
    const fontSpecification = "12px Consolas";
    const textLineHeight = 16;
    const annotationMargin = 10;
    const expandCollapseIconWidth = 36;
    const nodeCornerRadius = 3;
    let totalLinesCount = 0;

    // Set node constraints
    node.constraints =
        ej.diagrams.NodeConstraints.Default &
        ~(
            ej.diagrams.NodeConstraints.Rotate |
            ej.diagrams.NodeConstraints.Select |
            ej.diagrams.NodeConstraints.Resize |
            ej.diagrams.NodeConstraints.Delete |
            ej.diagrams.NodeConstraints.Drag
        );

    // Apply basic styling
    node.shape = {
        type: "Basic",
        shape: isMainRootNode ? "Ellipse" : "Rectangle",
        cornerRadius: nodeCornerRadius,
    };
    node.style = {
        fill: currentThemeSettings.nodeFillColor,
        strokeColor: currentThemeSettings.nodeStrokeColor,
        strokeWidth: 1.5,
    };

    // Set node dimensions
    if (!isMainRootNode) {
        let {
            width: calculatedWidth,
            height: calculatedHeight,
            linesCount: calculatedLinesCount,
        } = calculateNodeSize(
            node,
            fontSpecification,
            annotationMargin,
            textLineHeight,
            expandCollapseIconWidth
        );
        node.width = calculatedWidth;
        node.height = calculatedHeight;
        totalLinesCount = calculatedLinesCount;
    } else {
        node.width = 40;
        node.height = 40;
        totalLinesCount = 0;
    }

    // Configure annotations
    configureNodeAnnotations(
        node,
        isLeafNode,
        fontSpecification,
        annotationMargin,
        expandCollapseIconWidth
    );

    // Configure expand/collapse icons
    configureExpandCollapseIcons(
        node,
        isLeafNode,
        isMainRootNode,
        expandCollapseIconWidth,
        nodeCornerRadius
    );

    return node;
}

// Configure annotations for nodes based on their type
function configureNodeAnnotations(node, isLeafNode, fontSpecification, annotationMargin, expandCollapseIconWidth) {
    if (!node.annotations) return;

    if (isLeafNode) {
        configureLeafNodeAnnotations(node, fontSpecification, annotationMargin);
    } else if (node.annotations.length === 2 && !isLeafNode) {
        configureParentNodeAnnotations(node, annotationMargin, expandCollapseIconWidth);
    }
}

// Configure annotations for leaf nodes (key-value pairs)
function configureLeafNodeAnnotations(node, fontSpecification, annotationMargin) {
    const nodeAnnotationsList = node.annotations || [];
    const keyAnnotationsList = nodeAnnotationsList.filter((annotation) =>
        annotation.id?.startsWith("Key")
    );
    let totalLinesCount = keyAnnotationsList.length;
    let verticalSpacing = totalLinesCount > 0 ? 1.0 / (totalLinesCount + 1) : 0.5;
    let currentLineNumber = 1;

    for (let annotationIndex = 0; annotationIndex < nodeAnnotationsList.length; annotationIndex++) {
        const currentAnnotation = nodeAnnotationsList[annotationIndex];
        if (!currentAnnotation.id) continue;

        let verticalOffset = currentLineNumber * verticalSpacing;

        if (currentAnnotation.id.startsWith("Key")) {
            currentAnnotation.style = {
                fontSize: 12,
                fontFamily: "Consolas",
                color: currentThemeSettings.textKeyColor,
            };
            const keyTextWidth = getTextWidth(currentAnnotation.content, fontSpecification);
            const keyHorizontalOffset =
                keyTextWidth / 2 / node.width + annotationMargin / node.width;
            currentAnnotation.offset = { x: keyHorizontalOffset, y: verticalOffset };
        } else {
            currentAnnotation.style = {
                fontSize: 12,
                fontFamily: "Consolas",
                color: currentThemeSettings.textValueColor,
            };
            const previousAnnotation = nodeAnnotationsList[annotationIndex - 1];
            const keyTextWidth = previousAnnotation
                ? getTextWidth(previousAnnotation.content, fontSpecification)
                : 0;
            const valueTextWidth = getTextWidth(currentAnnotation.content, fontSpecification);
            const keyHorizontalOffset = keyTextWidth / 2 / node.width;
            const valueHorizontalOffset =
                keyHorizontalOffset * 2 +
                valueTextWidth / 2 / node.width +
                (annotationMargin + 8) / node.width;
            if (previousAnnotation) {
                currentAnnotation.offset = {
                    x: valueHorizontalOffset,
                    y: verticalOffset,
                };
                currentAnnotation.content = formatDisplayValue(currentAnnotation.content);
            }
            currentLineNumber++;
        }
        applyAnnotationStyle(currentAnnotation, currentAnnotation?.content);
    }
}

// Configure annotations for parent nodes (key and count)
function configureParentNodeAnnotations(node, annotationMargin, expandCollapseIconWidth) {
    const keyAnnotation = node.annotations[0];
    const countAnnotation = node.annotations[1];

    // Key Text
    keyAnnotation.content = keyAnnotation.content;
    keyAnnotation.style = {
        fontSize: 12,
        fontFamily: "Consolas",
        color: currentThemeSettings.textKeyColor,
    };
    keyAnnotation.offset = { x: showChildItemsCount ? 0 : 0.5, y: 0.5 };
    keyAnnotation.margin = {
        left: showChildItemsCount
            ? annotationMargin
            : showExpandCollapseIcon
                ? -annotationMargin
                : 0,
    };
    keyAnnotation.horizontalAlignment = showChildItemsCount ? "Left" : "Center";

    // Count Text
    if (showChildItemsCount) {
        countAnnotation.visibility = true;
        countAnnotation.content = countAnnotation.content;
        countAnnotation.style = {
            fontSize: 12,
            fontFamily: "Consolas",
            color: currentThemeSettings.textValueColor,
        };
        countAnnotation.offset = { x: 1, y: 0.5 };
        countAnnotation.horizontalAlignment = "Right";
        countAnnotation.margin = {
            right:
                annotationMargin +
                (showExpandCollapseIcon ? expandCollapseIconWidth : 0),
        };
    } else {
        countAnnotation.visibility = false;
    }
}

// Configure expand/collapse icons for non-leaf nodes
function configureExpandCollapseIcons(node, isLeafNode, isMainRootNode, expandCollapseIconWidth, nodeCornerRadius) {
    if (!isLeafNode && !isMainRootNode && showExpandCollapseIcon) {
        const expandIconConfiguration = {
            shape: "Minus",
            width: expandCollapseIconWidth,
            height: node.height,
            cornerRadius: nodeCornerRadius,
            margin: { right: expandCollapseIconWidth / 2 },
            fill: currentThemeSettings.expandIconFillColor,
            borderColor: currentThemeSettings.expandIconBorder,
            iconColor: currentThemeSettings.expandIconColor,
        };
        const collapseIconConfiguration = {
            shape: "Plus",
            width: expandCollapseIconWidth,
            height: node.height,
            cornerRadius: nodeCornerRadius,
            margin: { right: expandCollapseIconWidth / 2 },
            fill: currentThemeSettings.expandIconFillColor,
            borderColor: currentThemeSettings.expandIconBorder,
            iconColor: currentThemeSettings.expandIconColor,
        };

        // Update offset based on current orientation
        updateExpandCollapseIconOffset(node);

        node.expandIcon = expandIconConfiguration;
        node.collapseIcon = collapseIconConfiguration;
    } else {
        node.expandIcon = { shape: "None", visibility: false };
        node.collapseIcon = { shape: "None", visibility: false };
    }
}

// Calculate and return the size of the node based on its content
function calculateNodeSize(node, fontSpecification = "12px Consolas", nodePadding, textLineHeight = 16, expandIconWidth = 36) {
    let maximumTextWidth = 0;
    let totalLinesCount = 0;

    const isLeafNode = node.additionalInfo?.isLeaf === true;
    const nodeAnnotations = node.annotations || [];

    if (isLeafNode) {
        const keyAnnotations = nodeAnnotations.filter((annotation) =>
            annotation.id?.startsWith("Key")
        );
        const valueAnnotations = nodeAnnotations.filter((annotation) =>
            annotation.id?.startsWith("Value")
        );
        totalLinesCount = keyAnnotations.length;

        for (let lineIndex = 0; lineIndex < totalLinesCount; lineIndex++) {
            const keyText = keyAnnotations[lineIndex]?.content || "";
            const valueText = valueAnnotations[lineIndex]?.content || "";
            const combinedKeyValueWidth = getTextWidth(
                keyText + "   " + valueText,
                fontSpecification
            );
            maximumTextWidth = Math.max(maximumTextWidth, combinedKeyValueWidth);
        }
        if (keyAnnotations.length == 0 && valueAnnotations.length == 0) {
            maximumTextWidth = Math.max(
                maximumTextWidth,
                getTextWidth(nodeAnnotations[0]?.content || " ", fontSpecification)
            );
        }
    } else if (nodeAnnotations.length === 2 && !isLeafNode) {
        const keyText = nodeAnnotations[0].content;
        const countText = nodeAnnotations[1].content;
        maximumTextWidth = getTextWidth(keyText + countText, fontSpecification);
        totalLinesCount = 1;
    }

    const calculatedWidth = Math.max(
        maximumTextWidth + nodePadding + (!isLeafNode ? expandIconWidth * 2 : 0),
        50
    );
    const calculatedHeight = Math.max(
        totalLinesCount * textLineHeight + nodePadding * 2,
        40
    );

    return {
        width: calculatedWidth,
        height: calculatedHeight,
        linesCount: totalLinesCount,
    };
}

// Apply specific styling to an annotation based on its type
function applyAnnotationStyle(annotation, rawAnnotationValue) {
    const annotationStyle = {
        fontFamily: "Consolas",
    };

    if (annotation.id.startsWith("Key")) {
        annotationStyle.color = currentThemeSettings.textKeyColor;
    } else if (annotation.id.startsWith("Value")) {
        annotationStyle.color = determineValueStyle(rawAnnotationValue);
    } else if (annotation.id.startsWith("Count")) {
        annotationStyle.color = currentThemeSettings.textValueColor;
    }

    annotation.style = annotationStyle;
}

// Determine the appropriate text color for a value based on its type
function determineValueStyle(rawValue) {
    if (!isNaN(parseFloat(rawValue))) {
        return currentThemeSettings.numericColor;
    } else if (
        rawValue.toLowerCase() === "true" ||
        rawValue.toLowerCase() === "false"
    ) {
        return rawValue.toLowerCase() === "true"
            ? currentThemeSettings.booleanColor
            : "red";
    }
    return currentThemeSettings.textValueColor;
}

// Format the raw value for display by adding quotes if it is a non-empty string
function formatDisplayValue(rawValue) {
    const isStringValue =
        isNaN(rawValue) &&
        rawValue.toLowerCase() !== "true" &&
        rawValue.toLowerCase() !== "false";
    if (!isStringValue) {
        return rawValue.toLowerCase() === "true" ||
            rawValue.toLowerCase() === "false"
            ? rawValue.toLowerCase()
            : rawValue;
    }
    if (isStringValue && rawValue.trim() !== "") {
        return rawValue.startsWith('"') && rawValue.endsWith('"')
            ? rawValue
            : `"${rawValue}"`;
    }
    return rawValue;
}

// Update the offset position for the expand/collapse icons based on the current diagram orientation
function updateExpandCollapseIconOffset(node) {
    if (node.expandIcon && node.collapseIcon) {
        if (
            currentOrientation === "LeftToRight" ||
            currentOrientation === "RightToLeft"
        ) {
            node.expandIcon.offset = node.collapseIcon.offset = {
                x: 0.5,
                y: currentOrientation === "RightToLeft" ? 0 : 1,
            };
        } else if (
            currentOrientation === "TopToBottom" ||
            currentOrientation === "BottomToTop"
        ) {
            node.expandIcon.offset = node.collapseIcon.offset = { x: 1, y: 0.5 };
        }
    }
}

// Define default styling and behavior for diagram connectors
function getConnectorDefaults(connector) {
    connector.constraints = ej.diagrams.ConnectorConstraints.Default & ej.diagrams.ConnectorConstraints.Select;
    connector.type = "Orthogonal";
    connector.style = {
        strokeColor: currentThemeSettings.connectorStrokeColor,
        strokeWidth: 2,
    };
    connector.cornerRadius = 15;
    connector.targetDecorator = { shape: "None" };
    return connector;
}