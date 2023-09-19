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

	const adjustLevelAndSubLevel = node => {
		if (!node) return;
		if (node.left) {
			node.left.level = node.level + 1;
			node.left.levelPosition = 2 * node.levelPosition - 1;
			adjustLevelAndSubLevel(node.left);
			visitedTree = null;
		}
		if (node.right) {
			node.right.level = node.level + 1;
			node.right.levelPosition = 2 * node.levelPosition;
			adjustLevelAndSubLevel(node.right);
			visitedTree = null;
		}
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
		node[side].level = node.level;
		node[side].levelPosition = node.levelPosition;
		node[side].parentPos = node.parentPos;

		adjustLevelAndSubLevel(REPLACER_FOR_ONE_C_NODE);

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
				let side = parent.left === node ? "left" : "right";
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
				setTimeout(() => TREE.displayTree());
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
		}, 700);
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
			default:
				return NODE_COLOR;
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

const resetTreeBtnFn = () => {
	TREE = null;
	PATH_TRAVELED = [];
	HIGHLIGHTED_NODE = null;
	SEARCHING_NODE = null;
	REMOVING_NODE = null;
	REPLACER_FOR_TWO_C_NODE = null;
	REPLACER_FOR_ONE_C_NODE = null;
	TRAVERSING_NODE = null;
	background(BACKGROUND_COLOR);
};

const unhighlightNodesFn = () => {
	if (!TREE) return;
	PATH_TRAVELED = [];
	HIGHLIGHTED_NODE = null;
	SEARCHING_NODE = null;
	REMOVING_NODE = null;
	REPLACER_FOR_TWO_C_NODE = null;
	REPLACER_FOR_ONE_C_NODE = null;
	TRAVERSING_NODE = null;
	TREE.displayTree();
};

const RandomFillTreeBtnFn = () => {
	const nNodes = Math.random() * (10 - 6) + 6;
	TREE = binaryTree(Math.floor(Math.random() * 30));
	for (let i = 0; i < nNodes; i++) TREE.addNodeNoHighlight(Math.floor(Math.random() * 30));
	TREE.displayTree();
	unhighlightNodesFn();
};

const inorderTraverseBtnFn = () => {
	unhighlightNodesFn();
	if (!TREE) return;
	const inorderNodes = TREE.traverse();
	TREE.displayTraverse(inorderNodes);
};

const preorderTraverseBtnFn = () => {
	unhighlightNodesFn();
	if (!TREE) return;
	const inorderNodes = TREE.traverse("Preorder");
	TREE.displayTraverse(inorderNodes);
};

const postorderTraverseBtnFn = () => {
	unhighlightNodesFn();
	if (!TREE) return;
	const inorderNodes = TREE.traverse("Postorder");
	TREE.displayTraverse(inorderNodes);
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

	traverseBtn = createButton("Inorder Traverse");
	traverseBtn.position(426, 5);
	traverseBtn.mousePressed(inorderTraverseBtnFn);
	traverseBtn = createButton("Preorder Traverse");
	traverseBtn.position(543, 5);
	traverseBtn.mousePressed(preorderTraverseBtnFn);
	traverseBtn = createButton("Postorder Traverse");
	traverseBtn.position(668, 5);
	traverseBtn.mousePressed(postorderTraverseBtnFn);
}

function draw() {}
