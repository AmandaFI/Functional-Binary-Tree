// Display algorithm:
// Each node belongs to a level. Levels encrease from top to bottom. Root is in level 1.
// Each level accommodates at minimum 1 node and maximun 2^(level - 1) nodes. (if the root level was considered 0, each level would accommodate 2^level)
// Each note has a specific position in the level that it belongs. Tha position is determined by its parent position.
// The spacing between nodes in a given level is calculated by the canvas width divided by the maximun number of nodes that the level accommodates.
// The spacing between levels is calculated by the canvas height divided by the number of levels in the tree.

const NODE_COLOR = "#ffa07a";
const EDGE_COLOR = "#ffa07a";
const PATH_COLOR = "#90ee90";
const HIGHLIGHTED_NODE_COLOR = "#00ff00";
const ELEMENT_COLOR = 0;
const BACKGROUND_COLOR = "#171c26";
const SEARCHING_COLOR = "#ff4500";
const REMOVING_COLOR = "red";
const REPLACING_COLOR = "orange";
const TRAVERSING_COLOR = "#1e90ff";
const CURRENT_NODE_COLOR = "#00ffef";

const NODE_RADIUS = 40;
const DELAY = 300;

let TREE = null;

let PATH_TRAVELED = [];

let HIGHLIGHTED_NODE = null;
let SEARCHING_NODE = null;
let REMOVING_NODE = null;
let REPLACER_FOR_ONE_C_NODE = null;
let REPLACER_FOR_TWO_C_NODE = null;
let TRAVERSING_NODE = null;

let CURRENT_NODE = null;
let GENERATOR = null;
let INORDERORDER_GENERATOR = null;
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
			return;
		}

		PATH_TRAVELED.push(node);
		if (node[side]) setTimeout(() => addNode(element, node[side]), DELAY);
		else
			setTimeout(() => {
				TREE.displayTree();
				setTimeout(() => {
					node[side] = createNode(element, side, node);
					visitedTree = null;
					HIGHLIGHTED_NODE = node[side];
					TREE.displayTree();
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

	const updateSubtreeLevels = (node, newLevel, newLevelPosition) => {
		if (!node) return;

		node.level = newLevel;
		node.levelPosition = newLevelPosition;

		if (node.left) updateSubtreeLevels(node.left, newLevel + 1, 2 * newLevelPosition - 1);
		if (node.right) updateSubtreeLevels(node.right, newLevel + 1, 2 * newLevelPosition);
	};

	const deleteLeafNode = (node, parent) => {
		if (!parent) return;
		REMOVING_NODE = node;
		TREE.displayTree();

		if (parent.left && parent.left.element === node.element) parent.left = null;
		else parent.right = null;

		visitedTree = null;
		REMOVING_NODE = null;

		setTimeout(() => TREE.displayTree(), DELAY + 100);
	};

	const deleteNodeWithOneChild = (node, parent) => {
		REMOVING_NODE = node;
		let side = node.left ? "left" : "right";

		REPLACER_FOR_ONE_C_NODE = node[side];
		TREE.displayTree();
		//node[side].parentPos = node.parentPos;

		updateSubtreeLevels(REPLACER_FOR_ONE_C_NODE, node.level, node.levelPosition);

		visitedTree = null;
		if (!parent) root.element = REPLACER_FOR_ONE_C_NODE.element;
		else {
			REPLACER_FOR_ONE_C_NODE.parent = parent;
			if (parent.left && parent.left.element === node.element) parent.left = REPLACER_FOR_ONE_C_NODE;
			else parent.right = REPLACER_FOR_ONE_C_NODE;
		}
		setTimeout(() => {
			TREE.displayTree();
			REPLACER_NODE = null;
		}, DELAY + 100);
	};

	const deleteNodeWithTwoChildren = (node, parent) => {
		REPLACER_FOR_TWO_C_NODE = inOrderReplacer(node);
		REMOVING_NODE = node;
		if (!REPLACER_FOR_TWO_C_NODE) throw new Error("Node with two children without parent.");
		TREE.displayTree();
		setTimeout(() => {
			deleteNode(REPLACER_FOR_TWO_C_NODE.element);
			visitedTree = null;
			if (!parent) {
				root.element = REPLACER_FOR_TWO_C_NODE.element;
				REPLACER_FOR_TWO_C_NODE = root;
			} else {
				const side = parent.left === node ? "left" : "right";
				parent[side].element = REPLACER_FOR_TWO_C_NODE.element;
				REPLACER_FOR_TWO_C_NODE = parent[side];
			}
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

	const searchNode = (value, node = root) => {
		if (!node) {
			alert("Element is not in the tree.");
			unhighlightNodesFn();
			return;
		}
		SEARCHING_NODE = node;
		TREE.displayTree();

		const comparison = compareFn(value, node.element);
		switch (comparison) {
			case 0:
				HIGHLIGHTED_NODE = node;
				SEARCHING_NODE = null;
				TREE.displayTree();
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
		if (!array) return;
		setTimeout(() => {
			TRAVERSING_NODE = array[0];
			TREE.displayTree();
			if (array.length === 1) TRAVERSING_NODE = null;
			else displayTraverse(array.slice(1));
		}, 800);
	};

	const edgeColor = node => {
		if (PATH_TRAVELED.includes(node) || node === HIGHLIGHTED_NODE) return PATH_COLOR;
		return EDGE_COLOR;
	};

	const nodeColor = node => {
		if (PATH_TRAVELED.includes(node)) return PATH_COLOR;
		switch (node) {
			case SEARCHING_NODE:
				return SEARCHING_COLOR;
			case HIGHLIGHTED_NODE:
				return HIGHLIGHTED_NODE_COLOR;
			case REMOVING_NODE:
				return REMOVING_COLOR;
			case REPLACER_FOR_TWO_C_NODE:
			case REPLACER_FOR_ONE_C_NODE:
				return REPLACING_COLOR;
			case TRAVERSING_NODE:
				return TRAVERSING_COLOR;
			case CURRENT_NODE:
				return CURRENT_NODE_COLOR;
			default:
				return NODE_COLOR;
		}
	};

	const forEach = (fn, rootNode = root, order = "Inorder") => {
		const orderedNodes = visit(rootNode, order);
		for (let [index, node] of orderedNodes.entries()) fn(node.element, index);
	};

	const sortNodesByLevel = () => {
		if (!visitedTree) visitedTree = visit(root);

		const sortedNodes = {};
		visitedTree.forEach(node => {
			if (node.level in sortedNodes) sortedNodes[node.level].push(node);
			else sortedNodes[node.level] = [node];
		});

		return sortedNodes;
	};

	const setNodesPositions = () => {
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

	const displayTree = () => {
		setNodesPositions();

		if (!visitedTree) visitedTree = visit(root);
		background(BACKGROUND_COLOR);
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
			fill(0);
			textSize(17);
			text(node.element, node.x - NODE_RADIUS / 4, node.y + NODE_RADIUS / 5);
		});
	};

	function* navigateIterator() {
		let direction = yield CURRENT_NODE;

		while (direction !== "stop") {
			if (direction === "parent") direction = yield CURRENT_NODE.parent ? CURRENT_NODE.parent : CURRENT_NODE;
			else if (direction === "left") direction = yield CURRENT_NODE.left ? CURRENT_NODE.left : CURRENT_NODE;
			else if (direction === "right") direction = yield CURRENT_NODE.right ? CURRENT_NODE.right : CURRENT_NODE;
		}
		return;
	}

	function* inorderIterator(node = CURRENT_NODE) {
		if (node.left) yield* inorderIterator(node.left);
		yield node;
		if (node.right) yield* inorderIterator(node.right);
		return;
	}

	function* preorderIterator(node = CURRENT_NODE) {
		yield node;
		if (node.left) yield* preorderIterator(node.left);
		if (node.right) yield* preorderIterator(node.right);
		return;
	}

	function* postorderIterator(node = CURRENT_NODE) {
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
	if (!inputBox.value().match(/^\d+\.?\d*$/)) return;
	unhighlightNodesFn();
	if (!TREE) TREE = binaryTree(+inputBox.value());
	else TREE.add(+inputBox.value());
};

const deleteNodeBtnFn = () => {
	if (!inputBox.value().match(/^\d+\.?\d*$/)) return;
	if (!TREE) return;
	unhighlightNodesFn();
	TREE.removeNode(+inputBox.value());
};

const searchNodeBtnFn = () => {
	if (!inputBox.value().match(/^\d+\.?\d*$/)) return;
	if (!TREE) return;
	unhighlightNodesFn();
	TREE.search(+inputBox.value());
};

const resetVariables = () => {
	PATH_TRAVELED = [];
	HIGHLIGHTED_NODE = null;
	SEARCHING_NODE = null;
	REMOVING_NODE = null;
	REPLACER_FOR_TWO_C_NODE = null;
	REPLACER_FOR_ONE_C_NODE = null;
	TRAVERSING_NODE = null;
	stopGenerator();
	POSTORDER_GENERATOR = null;
	INORDER_GENERATOR = null;
	PREORDER_GENERATOR = null;
	CURRENT_NODE = null;
};

const resetTreeBtnFn = () => {
	TREE = null;
	resetVariables();
	background(BACKGROUND_COLOR);
};

const unhighlightNodesFn = () => {
	if (!TREE) return;
	resetVariables();
	TREE.displayTree();
};

const RandomFillTreeBtnFn = () => {
	unhighlightNodesFn();
	const nNodes = Math.random() * (10 - 6) + 6;
	TREE = binaryTree(Math.floor(Math.random() * 30));
	for (let i = 0; i < nNodes; i++) TREE.addNodeNoHighlight(Math.floor(Math.random() * 30));
	TREE.displayTree();
	unhighlightNodesFn();
};

const inorderTraverseBtnFn = () => {
	if (!TREE) return;
	unhighlightNodesFn();
	const inorderNodes = TREE.traverse();
	TREE.displayTraverse(inorderNodes);
};

const preorderTraverseBtnFn = () => {
	if (!TREE) return;
	unhighlightNodesFn();
	const inorderNodes = TREE.traverse("Preorder");
	TREE.displayTraverse(inorderNodes);
};

const postorderTraverseBtnFn = () => {
	if (!TREE) return;
	unhighlightNodesFn();
	const inorderNodes = TREE.traverse("Postorder");
	TREE.displayTraverse(inorderNodes);
};

const startGenerator = () => {
	unhighlightNodesFn();
	GENERATOR = TREE.navigateIterator();
	GENERATOR.next();
	CURRENT_NODE = TREE.root;
	TREE.displayTree();
};

const stopGenerator = () => {
	if (!GENERATOR) return;
	GENERATOR.next("stop");
	GENERATOR = null;
	CURRENT_NODE = null;
	unhighlightNodesFn();
};

const moveToLeftChild = () => {
	if (!TREE) return;
	if (!GENERATOR) startGenerator();
	let result = GENERATOR.next("left");
	CURRENT_NODE = result.done ? null : result.value;
	TREE.displayTree();
};

const moveToRightChild = () => {
	if (!TREE) return;
	if (!GENERATOR) startGenerator();
	let result = GENERATOR.next("right");
	CURRENT_NODE = result.done ? null : result.value;
	TREE.displayTree();
};

const moveToParent = () => {
	if (!TREE) return;
	if (!GENERATOR) startGenerator();
	let result = GENERATOR.next("parent");
	CURRENT_NODE = result.done ? null : result.value;
	TREE.displayTree();
};

const startPostGenerator = () => {
	unhighlightNodesFn();
	CURRENT_NODE = TREE.root;
	POSTORDER_GENERATOR = TREE.postorderIterator();
};

const stepPostorderTraverseBtnFn = () => {
	if (!TREE) return;
	if (!POSTORDER_GENERATOR) startPostGenerator();
	let result = POSTORDER_GENERATOR.next();
	if (result.done) {
		POSTORDER_GENERATOR = null;
		CURRENT_NODE = null;
		TREE.displayTree();
		return;
	}
	CURRENT_NODE = result.value;
	TREE.displayTree();
};

const startInorderGenerator = () => {
	unhighlightNodesFn();
	CURRENT_NODE = TREE.root;
	INORDER_GENERATOR = TREE.inorderIterator();
};

const stepInorderTraverseBtnFn = () => {
	if (!TREE) return;
	if (!INORDER_GENERATOR) startInorderGenerator();
	let result = INORDER_GENERATOR.next();
	if (result.done) {
		INORDER_GENERATOR = null;
		CURRENT_NODE = null;
		TREE.displayTree();
		return;
	}
	CURRENT_NODE = result.value;
	TREE.displayTree();
};

const startPreorderGenerator = () => {
	unhighlightNodesFn();
	CURRENT_NODE = TREE.root;
	PREORDER_GENERATOR = TREE.preorderIterator();
};

const stepPreorderTraverseBtnFn = () => {
	if (!TREE) return;
	if (!PREORDER_GENERATOR) startPreorderGenerator();
	let result = PREORDER_GENERATOR.next();
	if (result.done) {
		PREORDER_GENERATOR = null;
		CURRENT_NODE = null;
		TREE.displayTree();
		return;
	}
	CURRENT_NODE = result.value;
	TREE.displayTree();
};

function setup() {
	createCanvas(800, 600);
	//createCanvas(1400, 800);

	background(BACKGROUND_COLOR);

	inputBox = createInput("");
	inputBox.position(5, 5);
	inputBox.size(57);

	addBtn = createButton("Add");
	addBtn.position(72, 5);
	addBtn.mousePressed(addNodeBtnFn);
	delBtn = createButton("Delete");
	delBtn.position(114, 5);
	delBtn.mousePressed(deleteNodeBtnFn);
	searchBtn = createButton("Search");
	searchBtn.position(171, 5);
	searchBtn.mousePressed(searchNodeBtnFn);

	resetBtn = createButton("Reset");
	resetBtn.position(5, 30);
	resetBtn.mousePressed(resetTreeBtnFn);
	unhighlightBtn = createButton("Unhighlight");
	unhighlightBtn.position(58, 30);
	unhighlightBtn.mousePressed(unhighlightNodesFn);
	randomFillBtn = createButton("Random Fill");
	randomFillBtn.position(143, 30);
	randomFillBtn.mousePressed(RandomFillTreeBtnFn);

	inorderTraverseBtn = createButton("Inorder Traverse");
	inorderTraverseBtn.position(426, 5);
	inorderTraverseBtn.mousePressed(inorderTraverseBtnFn);
	preorderTraverseBtn = createButton("Preorder Traverse");
	preorderTraverseBtn.position(543, 5);
	preorderTraverseBtn.mousePressed(preorderTraverseBtnFn);
	postOrdeTraverseBtn = createButton("Postorder Traverse");
	postOrdeTraverseBtn.position(668, 5);
	postOrdeTraverseBtn.mousePressed(postorderTraverseBtnFn);

	stepInorderTraverseBtn = createButton("Step Inorder");
	stepInorderTraverseBtn.position(426, 27);
	stepInorderTraverseBtn.mousePressed(stepInorderTraverseBtnFn);
	stepPreorderTraverseBtn = createButton("Step Preorder");
	stepPreorderTraverseBtn.position(543, 27);
	stepPreorderTraverseBtn.mousePressed(stepPreorderTraverseBtnFn);
	stepPostOrdeTraverseBtn = createButton("Step Postorder");
	stepPostOrdeTraverseBtn.position(668, 27);
	stepPostOrdeTraverseBtn.mousePressed(stepPostorderTraverseBtnFn);

	parentBtn = createButton("\u25B2");
	parentBtn.position(26, 60);
	parentBtn.mousePressed(moveToParent);
	leftChildBtn = createButton("\u276E");
	leftChildBtn.position(12, 83);
	leftChildBtn.mousePressed(moveToLeftChild);
	rightChildBtn = createButton("\u276F");
	rightChildBtn.position(44, 83);
	rightChildBtn.mousePressed(moveToRightChild);
}

function draw() {}
