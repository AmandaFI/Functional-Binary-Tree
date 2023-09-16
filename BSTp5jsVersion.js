// Display algorithm:
// Each node belongs to a level. Levels encrease from top to bottom. Root is in level 1.
// Each level accommodates at minimum 1 node and maximun 2^(level - 1) nodes. (if the root level was considered 0, each level would accommodate 2^level)
// Each note has a specific position in the level that it belongs. Tha position is determined by its parent position.
// The spacing between nodes in a given level is calculated by the canvas width divided by the maximun number of nodes that the level accommodates.
// The spacing between levels is calculated by the canvas height divided by the number of levels in the tree.

let TREE = null;
let NODE_RADIUS = 40;
let NODE_COLOR = "#ffa07a";
let EDGE_COLOR = "#ffa07a";
let PATH_COLOR = "#90ee90";
let HIGHLIGHTED_NODE_COLOR = "#00ff00";
let ELEMENT_COLOR = 0;
let pathTraveled = [];
let highlightedNode = null;
let inputBox, addBtn, deleteBtn, searchBtn;
let BACKGROUND_COLOR = "#171c26";

const binaryTree = (rootElement, compareFn) => {
	if ((typeof rootElement === "object" && !compareFn) || typeof rootElement === "function")
		throw new Error("Unable to sort tree.");

	const createNode = (element, parentPos, parent = null, x = null, y = null) => {
		const level = parent ? parent.level + 1 : 1;
		let levelPosition;
		if (!parent) levelPosition = 1;
		else {
			if (parentPos === "left") levelPosition = 2 * parent.levelPosition - 1;
			else if (parentPos === "right") levelPosition = 2 * parent.levelPosition;
			else throw new Error("Child position unknow.");
		}

		return { element, left: null, right: null, parent, x, y, level, levelPosition, parentPos };
	};

	compareFn = compareFn
		? compareFn
		: (firstValue, secondValue) => {
				if (firstValue === secondValue) return 0;
				else if (firstValue > secondValue) return 1;
				else return -1;
		  };
	const root = createNode(rootElement);

	const isLeaf = node => !node.left && !node.right;
	const hasTwoChildren = node => (node.left && node.right ? true : false);
	const hasOnlyOneChild = node => !isLeaf(node) && !hasTwoChildren(node);

	const nodeHeight = (rootNode = root, height = 0) => {
		if (!rootNode) return height;
		const leftHeight = nodeHeight(rootNode.left, height + 1);
		const rightHeight = nodeHeight(rootNode.right, height + 1);
		return Math.max(leftHeight, rightHeight);
	};

	const timeDelay = seconds => {
		waitTime = millis() + seconds * 1000;
		while (millis() < waitTime) {}
	};

	const addNode = (element, node = root) => {
		if (compareFn(element, node.element) === -1) {
			if (node.left) {
				pathTraveled.push(node);
				//TREE.displayTree()
				addNode(element, node.left);
			} else {
				node.left = createNode(element, "left", node);
				highlightedNode = node.left;
				pathTraveled.push(node);
			}
		} else if (compareFn(element, node.element) === 1) {
			if (node.right) {
				pathTraveled.push(node);
				//TREE.displayTree()
				addNode(element, node.right);
			} else {
				node.right = createNode(element, "right", node);
				highlightedNode = node.right;
				pathTraveled.push(node);
			}
		} else {
			pathTraveled = [];
			highlightedNode = null;
			//TREE.displayTree()
		}
	};

	const rightMostElement = (node = root) => {
		if (isLeaf(node) || !node.right) return node.element;
		rightMostElement(node.right);
	};

	const leftMostElement = (node = root) => {
		if (isLeaf(node) || !node.left) return node.element;
		leftMostElement(node.left);
	};

	const ancestralReplacer = node => {
		if (node.parent && node.parent.left === node) return node.parent;
		else if (node.parent) return ancestralReplacer(node.parent);
		return false;
	};

	const inOrderReplacer = node => {
		if (node.right) {
			node = node.right;
			while (node.left) node = node.left;
			return node;
		} else {
			if (!node.parent) return false;
			return ancestralReplacer(node);
		}
	};

	const adjustLevelAndSubLevel = node => {
		if (!node) return;
		if (node.left) {
			node.left.level = node.level + 1;
			node.left.levelPosition = 2 * node.levelPosition - 1;
			adjustLevelAndSubLevel(node.left);
		}
		if (node.right) {
			node.right.level = node.level + 1;
			node.right.levelPosition = 2 * node.levelPosition;
			adjustLevelAndSubLevel(node.right);
		}
	};

	const deleteLeafNode = (node, parent) => {
		if (!parent) return;
		if (parent.left && parent.left.element === node.element) parent.left = null;
		else parent.right = null;
	};

	const deleteNodeWithOneChild = (node, parent) => {
		const replacerNode = node.left ? node.left : node.right;
		if (node.left) {
			node.left.level = node.level;
			node.left.levelPosition = node.levelPosition;
			node.left.parentPos = node.parentPos;
		}
		if (node.right) {
			node.right.level = node.level;
			node.right.levelPosition = node.levelPosition;
			node.right.parentPos = node.parentPos;
		}
		adjustLevelAndSubLevel(replacerNode);
		if (!parent) root.element = replacerNode.element;
		else {
			if (parent.left && parent.left.element === node.element) parent.left = replacerNode;
			else parent.right = replacerNode;
		}
	};

	const deleteNodeWithTwoChildren = (node, parent) => {
		const replacer = inOrderReplacer(node);
		if (!replacer) throw new Error("Node with two children without parent.");
		deleteNode(replacer.element);
		if (!parent) root.element = replacer.element;
		else {
			if (parent.left === node) parent.left.element = replacer.element;
			else parent.right.element = replacer.element;
		}
	};

	const deleteNode = (element, node = root) => {
		if (element === root.element && isLeaf(root)) {
			alert("Root deletion not allowed.");
			return false;
		}
		if (!node) return false;

		if (node.element === element) {
			if (!node.parent && node !== root) throw new Error(`Can not delete node with no parent.`);
			if (isLeaf(node)) deleteLeafNode(node, node.parent);
			else if (hasTwoChildren(node)) deleteNodeWithTwoChildren(node, node.parent);
			else deleteNodeWithOneChild(node, node.parent);
			return true;
		}
		if (compareFn(element, node.element) === -1) return deleteNode(element, node.left);
		else if (compareFn(element, node.element) === 1) return deleteNode(element, node.right);
		return false;
	};

	const visit = (node = root, order = "Inorder") => {
		if (!node) return [];
		const leftChildVisitResult = visit(node.left, order);
		const rightChildVisitResult = visit(node.right, order);
		switch (order) {
			case "Inorder":
				return [...leftChildVisitResult, node, ...rightChildVisitResult];
			case "Preorder":
				return [node, ...leftChildVisitResult, ...rightChildVisitResult];
			case "Postorder":
				return [...leftChildVisitResult, ...rightChildVisitResult, node];
			default:
				throw new Error("Unknown order.");
		}
	};

	const forEach = (fn, rootNode = root, order = "Inorder") => {
		const orderedNodes = visit(rootNode, order);
		for (let [index, node] of orderedNodes.entries()) fn(node.element, index);
	};

	const nodeForEach = (fn, rootNode = root, order = "Inorder") => {
		const orderedNodes = visit(rootNode, order);
		for (let [index, node] of orderedNodes.entries()) fn(node, index);
	};

	const searchNode = (value, node = root) => {
		if (!node) return;
		const comparison = compareFn(value, node.element);
		if (comparison === 0) {
			highlightedNode = node;
			return node;
		}
		if (comparison === -1 && node.left) {
			pathTraveled.push(node);
			return searchNode(value, node.left);
		}
		if (comparison === 1 && node) {
			pathTraveled.push(node);
			return searchNode(value, node.right);
		}
		pathTraveled = [];
		return false;
	};

	const traverse = (order = "Inorder", rootNode = root) => mapTree(element => element, rootNode, order);

	levelSort = () => {
		orderedNodes = visit(root);
		const sortedNodes = [];
		orderedNodes.forEach(node => {
			if (sortedNodes[node.level]) sortedNodes[node.level].push(node);
			else sortedNodes[node.level] = [node];
		});

		return sortedNodes;
	};

	setNodesPositions = () => {
		let levels = levelSort();
		let ySpacing = height / levels.length; // (levels.length + 1) ?
		levels.forEach((nodes, index) => {
			let xSpacing = width / (2 ** (nodes[0].level - 1) + 1); // + 1 is for the case when there is only the first level, otherwise would result in division by 0
			nodes.forEach(node => {
				node.x = node.levelPosition * xSpacing;
				node.y = index * ySpacing;
			});
		});
	};

	displayTree = () => {
		setNodesPositions();
		nodes = visit(root);
		nodes.forEach(node => {
			if (node.left) {
				let edgeColor = pathTraveled.includes(node.left) || node.left === highlightedNode ? PATH_COLOR : EDGE_COLOR;
				stroke(edgeColor);
				line(node.x, node.y, node.left.x, node.left.y);
			}

			if (node.right) {
				let edgeColor = pathTraveled.includes(node.right) || node.right === highlightedNode ? PATH_COLOR : EDGE_COLOR;
				stroke(edgeColor);
				line(node.x, node.y, node.right.x, node.right.y);
			}

			let nodeColor = pathTraveled.includes(node) ? PATH_COLOR : node === highlightedNode ? HIGHLIGHTED_NODE_COLOR : NODE_COLOR;
			fill(nodeColor);
			noStroke();
			circle(node.x, node.y, NODE_RADIUS);
			noStroke();
			fill(0);
			textSize(17);
			text(node.element, node.x - NODE_RADIUS / 4, node.y + NODE_RADIUS / 5);
		});
	};

	const add = element => addNode(element);
	const removeNode = element => deleteNode(element);
	const search = element => (searchNode(element) ? true : false);
	const calcHeight = (rootNode = root) => nodeHeight(rootNode);

	return {
		root,
		add,
		traverse,
		search,
		removeNode,
		forEach,
		inOrderReplacer,
		calcHeight,
		createNode,
		ancestralReplacer,
		hasTwoChildren,
		isLeaf,
		hasOnlyOneChild,
		nodeHeight,
		displayTree,
	};
};

function setup() {
	createCanvas(800, 600);
	//createCanvas(1400, 700);

	background(BACKGROUND_COLOR);

	inputBox = createInput("");
	inputBox.position(5, 5);
	inputBox.size(50);

	addBtn = createButton("Add");
	addBtn.position(65, 5);
	addBtn.mousePressed(addNodeBtnFn);
	delBtn = createButton("Delete");
	delBtn.position(105, 5);
	delBtn.mousePressed(deleteNodeBtnFn);
	searchBtn = createButton("Search");
	searchBtn.position(160, 5);
	searchBtn.mousePressed(searchNodeBtnFn);

	resetBtn = createButton("Reset");
	resetBtn.position(5, 30);
	resetBtn.mousePressed(resetTreeBtnFn);
	unhighlightBtn = createButton("Unhighlight");
	unhighlightBtn.position(57, 30);
	unhighlightBtn.mousePressed(unhighlightNodesFn);
	randomFillBtn = createButton("Random Fill");
	randomFillBtn.position(5, 55);
	randomFillBtn.mousePressed(RandomFillTreeBtnFn);
}

const addNodeBtnFn = () => {
	if (!inputBox.value().match(/^\d+\.?\d*$/)) return;
	pathTraveled = [];
	if (!TREE) TREE = binaryTree(+inputBox.value());
	else TREE.add(+inputBox.value());

	background(BACKGROUND_COLOR);
	TREE.displayTree();
};

const deleteNodeBtnFn = () => {
	if (!inputBox.value().match(/^\d+\.?\d*$/)) return;
	if (!TREE) return;
	pathTraveled = [];
	highlightedNode = null;
	TREE.removeNode(+inputBox.value());
	background(BACKGROUND_COLOR);
	TREE.displayTree();
};

const searchNodeBtnFn = () => {
	if (!inputBox.value().match(/^\d+\.?\d*$/)) return;
	if (!TREE) return;
	else {
		unhighlightNodesFn();
		const result = TREE.search(+inputBox.value());
		if (!result) alert("Element is not in the tree.");
		else displayTree();
	}
};

const resetTreeBtnFn = () => {
	TREE = null;
	pathTraveled = [];
	highlightedNode = null;
	background(BACKGROUND_COLOR);
};

const unhighlightNodesFn = () => {
	if (!TREE) return;
	pathTraveled = [];
	highlightedNode = null;
	TREE.displayTree();
};

const RandomFillTreeBtnFn = () => {
	TREE = binaryTree(6);
	TREE.add(2);
	TREE.add(9);
	TREE.add(1);
	TREE.add(4);
	TREE.add(8);
	TREE.add(13);
	TREE.add(18);
	background(BACKGROUND_COLOR);
	TREE.displayTree();
	unhighlightNodesFn();
};

function draw() {
	//TREE.displayTree()
}
