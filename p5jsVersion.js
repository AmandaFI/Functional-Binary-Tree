// Display algorithm:
// Each node belongs to a level. Levels encrease from top to bottom. Root is in level 1.
// Each level accommodates at minimum 1 node and maximun 2^(level - 1) nodes. (if the root level was considered 0, each level would accommodate 2^level)
// Each note has a specific position in the level that it belongs. Tha position is determined by its parent position.
// The spacing between nodes in a given level is calculated by the canvas width divided by the maximun number of nodes that the level accommodates.
// The spacing between levels is calculated by the canvas height divided by the number of levels in the tree.

const colors = {
	NODE: "#ffa07a",
	EDGE: "#ffa07a",
	PATH: "#90ee90",
	HIGHLIGHT: "#00ff00",
	ELEMENT: 0,
	BACKGROUND: "#171c26",
	SEARCHING: "#ff4500",
	REMOVING: "red",
	REPLACING: "orange",
	TRAVERSING: "#1e90ff",
	CURRENT_NODE: "#00ffef",
};

const coloredNodes = {
	HIGHLIGHTED: null,
	SEARCHING: null,
	REMOVING: null,
	REPLACER_FOR_ONE_C: null,
	REPLACER_FOR_TWO_C: null,
	TRAVERSING: null,
	CURRENT_GENERATOR: null,
};

let actionInProgress = false;

const NODE_RADIUS = 40;
const DELAY = 300;

let TREE = null;

let PATH_TRAVELED = [];

let NAVIGATE_GENERATOR = null;
let INORDER_GENERATOR = null;
let PREORDER_GENERATOR = null;
let POSTORDER_GENERATOR = null;

let inputBox, addBtn, deleteBtn, searchBtn;

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
			else throw new Error("Child position unknown.");
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
	let visitedTree = null;

	const isLeaf = node => !node.left && !node.right;
	const hasTwoChildren = node => (node.left && node.right ? true : false);
	const hasOnlyOneChild = node => !isLeaf(node) && !hasTwoChildren(node);

	const addNode = (element, node = root) => {
		TREE.displayTree();
		let side;
		if (compareFn(element, node.element) === -1) side = "left";
		else if (compareFn(element, node.element) === 1) side = "right";
		else {
			unhighlightNodesFn();
			actionInProgress = false;
			return;
		}

		PATH_TRAVELED.push(node);
		if (node[side]) setTimeout(() => addNode(element, node[side]), DELAY);
		else
			setTimeout(() => {
				TREE.displayTree();
				node[side] = createNode(element, side, node);
				visitedTree = null;
				coloredNodes.HIGHLIGHTED = node[side];
				setTimeout(() => {
					TREE.displayTree();
					actionInProgress = false;
				}, DELAY);
			}, DELAY);
	};

	const addNodeNoHighlight = (element, node = root) => {
		let side;
		const comparison = compareFn(element, node.element);

		if (comparison === -1) side = "left";
		else if (comparison === 1) side = "right";
		else return;

		if (node[side]) addNodeNoHighlight(element, node[side]);
		else {
			node[side] = createNode(element, side, node);
			visitedTree = null;
		}
	};

	const inorderSucessor = node => {
		if (node.right) {
			node = node.right;
			while (node.left) node = node.left;
			return node;
		}
		return false;
	};

	const updateSubtreeLevels = (node, newLevel, newLevelPosition) => {
		if (!node) return;

		node.level = newLevel;
		node.levelPosition = newLevelPosition;

		if (node.left) updateSubtreeLevels(node.left, newLevel + 1, 2 * newLevelPosition - 1);
		if (node.right) updateSubtreeLevels(node.right, newLevel + 1, 2 * newLevelPosition);
	};

	const deleteLeafNode = (node, parent) => {
		if (!parent) return;
		coloredNodes.REMOVING = node;
		TREE.displayTree();

		if (parent.left && parent.left.element === node.element) parent.left = null;
		else parent.right = null;

		visitedTree = null;
		coloredNodes.REMOVING = null;

		setTimeout(() => {
			TREE.displayTree();
			actionInProgress = false;
		}, DELAY + 100);
	};

	const deleteNodeWithOnlyChild = (node, parent) => {
		coloredNodes.REMOVING = node;
		let side = node.left ? "left" : "right";

		coloredNodes.REPLACER_FOR_ONE_C = node[side];
		TREE.displayTree();
		//node[side].parentPos = node.parentPos;

		updateSubtreeLevels(coloredNodes.REPLACER_FOR_ONE_C, node.level, node.levelPosition);

		visitedTree = null;
		if (!parent) {
			root.element = coloredNodes.REPLACER_FOR_ONE_C.element;
			root.left = coloredNodes.REPLACER_FOR_ONE_C.left;
			root.right = coloredNodes.REPLACER_FOR_ONE_C.right;
		} else {
			coloredNodes.REPLACER_FOR_ONE_C.parent = parent;
			if (parent.left && parent.left.element === node.element) parent.left = coloredNodes.REPLACER_FOR_ONE_C;
			else parent.right = coloredNodes.REPLACER_FOR_ONE_C;
		}
		setTimeout(() => {
			TREE.displayTree();
			REPLACER_NODE = null;
			actionInProgress = false;
		}, DELAY + 100);
	};

	const deleteNodeWithBothChildren = (node, parent) => {
		coloredNodes.REPLACER_FOR_TWO_C = inorderSucessor(node);
		coloredNodes.REMOVING = node;
		if (!coloredNodes.REPLACER_FOR_TWO_C) throw new Error("Node with two children without parent.");
		TREE.displayTree();
		setTimeout(() => {
			deleteNode(coloredNodes.REPLACER_FOR_TWO_C.element);
			visitedTree = null;
			if (!parent) {
				root.element = coloredNodes.REPLACER_FOR_TWO_C.element;
				coloredNodes.REPLACER_FOR_TWO_C = root;
			} else {
				const side = parent.left === node ? "left" : "right";
				parent[side].element = coloredNodes.REPLACER_FOR_TWO_C.element;
				coloredNodes.REPLACER_FOR_TWO_C = parent[side];
			}
			actionInProgress = false;
		}, DELAY + 200);
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
			else if (hasTwoChildren(node)) deleteNodeWithBothChildren(node, node.parent);
			else deleteNodeWithOnlyChild(node, node.parent);
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

	const searchNode = (value, node = root) => {
		if (!node) {
			alert("Element is not in the tree.");
			unhighlightNodesFn();
			actionInProgress = false;
			return;
		}
		coloredNodes.SEARCHING = node;
		TREE.displayTree();

		const comparison = compareFn(value, node.element);
		switch (comparison) {
			case 0:
				coloredNodes.HIGHLIGHTED = node;
				coloredNodes.SEARCHING = null;
				TREE.displayTree();
				actionInProgress = false;
				return;
			case -1:
				setTimeout(() => searchNode(value, node.left), DELAY);
				break;
			case 1:
				setTimeout(() => searchNode(value, node.right), DELAY);
				break;
			default:
				throw new Error("Error in comparison function.");
		}
	};

	const displayTraverse = array => {
		if (!array) actionInProgress = false;
		else {
			setTimeout(() => {
				coloredNodes.TRAVERSING = array[0];
				TREE.displayTree();
				if (array.length === 1) {
					coloredNodes.TRAVERSING = null;
					actionInProgress = false;
				} else displayTraverse(array.slice(1));
			}, 800);
		}
	};

	const edgeColor = node => {
		if (PATH_TRAVELED.includes(node) || node === coloredNodes.HIGHLIGHTED) return colors.PATH;
		return colors.EDGE;
	};

	const nodeColor = node => {
		if (PATH_TRAVELED.includes(node)) return colors.PATH;
		switch (node) {
			case coloredNodes.SEARCHING:
				return colors.SEARCHING;
			case coloredNodes.HIGHLIGHTED:
				return colors.HIGHLIGHT;
			case coloredNodes.REMOVING:
				return colors.REMOVING;
			case coloredNodes.REPLACER_FOR_TWO_C:
			case coloredNodes.REPLACER_FOR_ONE_C:
				return colors.REPLACING;
			case coloredNodes.TRAVERSING:
				return colors.TRAVERSING;
			case coloredNodes.CURRENT_GENERATOR:
				return colors.CURRENT_NODE;
			default:
				return colors.NODE;
		}
	};

	const forEach = (fn, rootNode = root, order = "Inorder") => {
		const orderedNodes = visit(rootNode, order);
		for (let [index, node] of orderedNodes.entries()) fn(node.element, index);
	};

	sortNodesByLevel = () => {
		if (!visitedTree) visitedTree = visit(root);

		const sortedNodes = {};
		visitedTree.forEach(node => {
			if (node.level in sortedNodes) sortedNodes[node.level].push(node);
			else sortedNodes[node.level] = [node];
		});

		return sortedNodes;
	};

	setNodesPositions = () => {
		let sortedNodes = sortNodesByLevel();
		const ySpacing = height / (Object.keys(sortedNodes).length + 1); // + 1 avoids sticking the root node  to the top of the screen

		Object.keys(sortedNodes).forEach((level, index) => {
			let xSpacing = width / (2 ** (parseInt(level) - 1) + 1); // + 1 avoids sticking the rightmost node to the right side of the screen
			sortedNodes[level].forEach(node => {
				node.x = node.levelPosition * xSpacing;
				node.y = (index + 1) * ySpacing;
			});
		});
	};

	displayTree = () => {
		setNodesPositions();

		if (!visitedTree) visitedTree = visit(root);
		background(colors.BACKGROUND);
		visitedTree.forEach(node => {
			if (node.left) {
				stroke(edgeColor(node.left));
				line(node.x, node.y, node.left.x, node.left.y);
			}
			if (node.right) {
				stroke(edgeColor(node.right));
				line(node.x, node.y, node.right.x, node.right.y);
			}
			fill(nodeColor(node));
			noStroke();
			circle(node.x, node.y, NODE_RADIUS);
			noStroke();
			fill(colors.ELEMENT);
			textSize(17);
			text(node.element, node.x - NODE_RADIUS / 4, node.y + NODE_RADIUS / 5);
		});
	};

	function* navigateIterator() {
		let direction = yield coloredNodes.CURRENT_GENERATOR;

		while (direction !== "stop") {
			if (direction === "parent")
				direction = yield coloredNodes.CURRENT_GENERATOR.parent
					? coloredNodes.CURRENT_GENERATOR.parent
					: coloredNodes.CURRENT_GENERATOR;
			else if (direction === "left")
				direction = yield coloredNodes.CURRENT_GENERATOR.left
					? coloredNodes.CURRENT_GENERATOR.left
					: coloredNodes.CURRENT_GENERATOR;
			else if (direction === "right")
				direction = yield coloredNodes.CURRENT_GENERATOR.right
					? coloredNodes.CURRENT_GENERATOR.right
					: coloredNodes.CURRENT_GENERATOR;
		}
		return;
	}

	function* inorderIterator(node = coloredNodes.CURRENT_GENERATOR) {
		if (node.left) yield* inorderIterator(node.left);
		yield node;
		if (node.right) yield* inorderIterator(node.right);
		return;
	}

	function* preorderIterator(node = coloredNodes.CURRENT_GENERATOR) {
		yield node;
		if (node.left) yield* preorderIterator(node.left);
		if (node.right) yield* preorderIterator(node.right);
		return;
	}

	function* postorderIterator(node = coloredNodes.CURRENT_GENERATOR) {
		if (node.left) yield* postorderIterator(node.left);
		if (node.right) yield* postorderIterator(node.right);
		yield node;
		return;
	}

	const add = element => addNode(element);
	const removeNode = element => deleteNode(element);
	const search = element => (searchNode(element) ? true : false);
	const traverse = (order = "Inorder", rootNode = root) => visit(rootNode, order);

	return {
		root,
		add,
		traverse,
		search,
		removeNode,
		forEach,
		displayTree,
		addNodeNoHighlight,
		displayTraverse,
		navigateIterator,
		inorderIterator,
		preorderIterator,
		postorderIterator,
	};
};

const addNodeBtnFn = () => {
	if (actionInProgress) return;
	if (!inputBox.value().match(/^\d+\.?\d*$/)) return;
	unhighlightNodesFn();
	if (!TREE) {
		TREE = binaryTree(+inputBox.value());
		TREE.displayTree();
	} else {
		actionInProgress = true;
		TREE.add(+inputBox.value());
	}
};

const deleteNodeBtnFn = () => {
	if (actionInProgress) return;
	if (!inputBox.value().match(/^\d+\.?\d*$/) || !TREE) return;
	unhighlightNodesFn();
	actionInProgress = true;
	TREE.removeNode(+inputBox.value());
};

const searchNodeBtnFn = () => {
	if (actionInProgress) return;
	if (!inputBox.value().match(/^\d+\.?\d*$/) || !TREE) return;
	unhighlightNodesFn();
	actionInProgress = true;
	TREE.search(+inputBox.value());
};

const resetVariables = () => {
	PATH_TRAVELED = [];
	coloredNodes.HIGHLIGHTED = null;
	coloredNodes.SEARCHING = null;
	coloredNodes.REMOVING = null;
	coloredNodes.REPLACER_FOR_TWO_C = null;
	coloredNodes.REPLACER_FOR_ONE_C = null;
	coloredNodes.TRAVERSING = null;
	stopGenerator();
	POSTORDER_GENERATOR = null;
	INORDER_GENERATOR = null;
	PREORDER_GENERATOR = null;
	coloredNodes.CURRENT_GENERATOR = null;
};

const resetTreeBtnFn = () => {
	if (actionInProgress) return;
	TREE = null;
	resetVariables();
	background(colors.BACKGROUND);
};

const unhighlightNodesFn = () => {
	if (!TREE) return;
	resetVariables();
	TREE.displayTree();
};

const RandomFillTreeBtnFn = () => {
	if (actionInProgress) return;
	unhighlightNodesFn();
	const nNodes = Math.random() * (10 - 6) + 6;
	TREE = binaryTree(Math.floor(Math.random() * 30));
	for (let i = 0; i < nNodes; i++) TREE.addNodeNoHighlight(Math.floor(Math.random() * 30));
	TREE.displayTree();
	unhighlightNodesFn();
};

const inorderTraverseBtnFn = () => {
	if (!TREE || actionInProgress) return;
	unhighlightNodesFn();
	const inorderNodes = TREE.traverse();
	actionInProgress = true;
	TREE.displayTraverse(inorderNodes);
};

const preorderTraverseBtnFn = () => {
	if (!TREE || actionInProgress) return;
	unhighlightNodesFn();
	const inorderNodes = TREE.traverse("Preorder");
	actionInProgress = true;
	TREE.displayTraverse(inorderNodes);
};

const postorderTraverseBtnFn = () => {
	if (!TREE || actionInProgress) return;
	unhighlightNodesFn();
	const inorderNodes = TREE.traverse("Postorder");
	actionInProgress = true;
	TREE.displayTraverse(inorderNodes);
};

const startGenerator = () => {
	if (actionInProgress) return;
	unhighlightNodesFn();
	NAVIGATE_GENERATOR = TREE.navigateIterator();
	NAVIGATE_GENERATOR.next();
	coloredNodes.CURRENT_GENERATOR = TREE.root;
	TREE.displayTree();
};

const stopGenerator = () => {
	if (!NAVIGATE_GENERATOR || actionInProgress) return;
	NAVIGATE_GENERATOR.next("stop");
	NAVIGATE_GENERATOR = null;
	coloredNodes.CURRENT_GENERATOR = null;
	unhighlightNodesFn();
};

const moveToLeftChild = () => {
	if (!TREE || actionInProgress) return;
	if (!NAVIGATE_GENERATOR) startGenerator();
	let result = NAVIGATE_GENERATOR.next("left");
	coloredNodes.CURRENT_GENERATOR = result.done ? null : result.value;
	TREE.displayTree();
};

const moveToRightChild = () => {
	if (!TREE || actionInProgress) return;
	if (!NAVIGATE_GENERATOR) startGenerator();
	let result = NAVIGATE_GENERATOR.next("right");
	coloredNodes.CURRENT_GENERATOR = result.done ? null : result.value;
	TREE.displayTree();
};

const moveToParent = () => {
	if (!TREE || actionInProgress) return;
	if (!NAVIGATE_GENERATOR) startGenerator();
	let result = NAVIGATE_GENERATOR.next("parent");
	coloredNodes.CURRENT_GENERATOR = result.done ? null : result.value;
	TREE.displayTree();
};

const startPostGenerator = () => {
	if (actionInProgress) return;
	unhighlightNodesFn();
	coloredNodes.CURRENT_GENERATOR = TREE.root;
	POSTORDER_GENERATOR = TREE.postorderIterator();
};

const stepPostorderTraverseBtnFn = () => {
	if (!TREE || actionInProgress) return;
	if (!POSTORDER_GENERATOR) startPostGenerator();
	let result = POSTORDER_GENERATOR.next();
	if (result.done) {
		POSTORDER_GENERATOR = null;
		coloredNodes.CURRENT_GENERATOR = null;
		TREE.displayTree();
		return;
	}
	coloredNodes.CURRENT_GENERATOR = result.value;
	TREE.displayTree();
};

const startInorderGenerator = () => {
	if (actionInProgress) return;
	unhighlightNodesFn();
	coloredNodes.CURRENT_GENERATOR = TREE.root;
	INORDER_GENERATOR = TREE.inorderIterator();
};

const stepInorderTraverseBtnFn = () => {
	if (!TREE || actionInProgress) return;
	if (!INORDER_GENERATOR) startInorderGenerator();
	let result = INORDER_GENERATOR.next();
	if (result.done) {
		INORDER_GENERATOR = null;
		coloredNodes.CURRENT_GENERATOR = null;
		TREE.displayTree();
		return;
	}
	coloredNodes.CURRENT_GENERATOR = result.value;
	TREE.displayTree();
};

const startPreorderGenerator = () => {
	if (actionInProgress) return;
	unhighlightNodesFn();
	coloredNodes.CURRENT_GENERATOR = TREE.root;
	PREORDER_GENERATOR = TREE.preorderIterator();
};

const stepPreorderTraverseBtnFn = () => {
	if (!TREE || actionInProgress) return;
	if (!PREORDER_GENERATOR) startPreorderGenerator();
	let result = PREORDER_GENERATOR.next();
	if (result.done) {
		PREORDER_GENERATOR = null;
		coloredNodes.CURRENT_GENERATOR = null;
		TREE.displayTree();
		return;
	}
	coloredNodes.CURRENT_GENERATOR = result.value;
	TREE.displayTree();
};

const button = (title, x, y, pressedFn) => {
	const btn = createButton(title);
	btn.position(x, y);
	btn.mousePressed(pressedFn);
	return btn;
};

function setup() {
	// createCanvas(800, 600);
	//createCanvas(1400, 800);
	createCanvas(windowWidth, windowHeight);

	background(colors.BACKGROUND);

	inputBox = createInput("");
	inputBox.position(5, 5);
	inputBox.size(57);

	addBtn = button("Add", 72, 5, addNodeBtnFn);
	delBtn = button("Delete", 114, 5, deleteNodeBtnFn);
	searchBtn = button("Search", 171, 5, searchNodeBtnFn);
	resetBtn = button("Reset", 5, 30, resetTreeBtnFn);
	unhighlightBtn = button("Unhighlight", 58, 30, unhighlightNodesFn);
	randomFillBtn = button("Random Fill", 143, 30, RandomFillTreeBtnFn);

	inorderTraverseBtn = button("Inorder Traverse", 426, 5, inorderTraverseBtnFn);
	preorderTraverseBtn = button("Preorder Traverse", 543, 5, preorderTraverseBtnFn);
	postOrdeTraverseBtn = button("Postorder Traverse", 668, 5, postorderTraverseBtnFn);

	stepInorderTraverseBtn = button("Step Inorder", 426, 27, stepInorderTraverseBtnFn);
	stepPreorderTraverseBtn = button("Step Preorder", 543, 27, stepPreorderTraverseBtnFn);
	stepPostOrdeTraverseBtn = button("Step Postorder", 668, 27, stepPostorderTraverseBtnFn);

	parentBtn = button("\u25B2", 26, 60, moveToParent);
	leftChildBtn = button("\u276E", 12, 83, moveToLeftChild);
	rightChildBtn = button("\u276F", 44, 83, moveToRightChild);
}

// Redraws the Canvas when resized.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {}
