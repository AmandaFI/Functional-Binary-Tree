// Display algorithm:
// Each node belongs to a level. Levels encrease from top to bottom. Root is in level 1.
// Each level accommodates at minimum 1 node and maximun 2^(level - 1) nodes. (if the root level was considered 0, each level would accommodate 2^level)
// Each note has a specific position in the level that it belongs. Tha position is determined by its parent position.
// The spacing between nodes in a given level is calculated by the canvas width divided by the maximun number of nodes that the level accommodates.
// The spacing between levels is calculated by the canvas height divided by the number of levels in the tree.

// generators pode melhorar a performance do meu codigo ?

let TREE = null;
let NODE_RADIUS = 40;
let NODE_COLOR = "#ffa07a";
let EDGE_COLOR = "#ffa07a";
let PATH_COLOR = "#90ee90";
let HIGHLIGHTED_NODE_COLOR = "#00ff00";
let ELEMENT_COLOR = 0;
let pathTraveled = [];
let highlightedNode = null;
let searchingNode = null;
let inputBox, addBtn, deleteBtn, searchBtn;
let BACKGROUND_COLOR = "#171c26";
let traversePath = [];
let speed = 300;
let REMOVE_NODE = null;
let REPLACER_NODE_ONE_CHILD = null;
let REPLACER_NODE_TWO_CHILDREN = null;
let TRAVERSE_NODE = null;

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

	const addNode = (element, node = root) => {
		const tempPath = pathTraveled;
		unhighlightNodesFn();
		pathTraveled = tempPath;
		TREE.displayTree();
		if (compareFn(element, node.element) === -1) {
			if (node.left) {
				setTimeout(() => {
					pathTraveled.push(node);
					addNode(element, node.left);
				}, speed);
			} else {
				setTimeout(() => {
					pathTraveled.push(node);
					TREE.displayTree();
					setTimeout(() => {
						node.left = createNode(element, "left", node);
						highlightedNode = node.left;
						background(BACKGROUND_COLOR);
						TREE.displayTree();
					}, speed);
				}, speed);
			}
		} else if (compareFn(element, node.element) === 1) {
			if (node.right) {
				setTimeout(() => {
					pathTraveled.push(node);
					addNode(element, node.right);
				}, speed);
			} else {
				setTimeout(() => {
					pathTraveled.push(node);
					TREE.displayTree();

					setTimeout(() => {
						node.right = createNode(element, "right", node);
						highlightedNode = node.right;
						background(BACKGROUND_COLOR);
						TREE.displayTree();
					}, speed);
				}, speed);
			}
		} else {
			pathTraveled = [];
			highlightedNode = null;
			TREE.displayTree();
		}
	};

	const addNodeNoHighlight = (element, node = root) => {
		if (compareFn(element, node.element) === -1) {
			if (node.left) {
				pathTraveled.push(node);
				addNodeNoHighlight(element, node.left);
			} else {
				node.left = createNode(element, "left", node);
				highlightedNode = node.left;
				pathTraveled.push(node);
			}
		} else if (compareFn(element, node.element) === 1) {
			if (node.right) {
				pathTraveled.push(node);
				addNodeNoHighlight(element, node.right);
			} else {
				node.right = createNode(element, "right", node);
				highlightedNode = node.right;
				pathTraveled.push(node);
			}
		} else {
			pathTraveled = [];
			highlightedNode = null;
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
		REMOVE_NODE = node;
		TREE.displayTree();

		if (parent.left && parent.left.element === node.element) parent.left = null;
		else parent.right = null;
		console.log(parent);
		REMOVE_NODE = null;

		setTimeout(() => {
			console.log("leaf node após deletado");
			background(BACKGROUND_COLOR);
			TREE.displayTree();
		}, speed + 100);
	};

	const deleteNodeWithOneChild = (node, parent) => {
		REMOVE_NODE = node;
		if (node.left) {
			REPLACER_NODE_ONE_CHILD = node.left;
			TREE.displayTree();
			node.left.level = node.level;
			node.left.levelPosition = node.levelPosition;
			node.left.parentPos = node.parentPos;
		}
		if (node.right) {
			REPLACER_NODE_ONE_CHILD = node.right;
			TREE.displayTree();
			node.right.level = node.level;
			node.right.levelPosition = node.levelPosition;
			node.right.parentPos = node.parentPos;
		}

		adjustLevelAndSubLevel(REPLACER_NODE_ONE_CHILD);

		if (!parent) root.element = REPLACER_NODE_ONE_CHILD.element;
		else {
			REPLACER_NODE_ONE_CHILD.parent = parent;
			if (parent.left && parent.left.element === node.element) parent.left = REPLACER_NODE_ONE_CHILD;
			else parent.right = REPLACER_NODE_ONE_CHILD;
		}
		setTimeout(() => {
			background(BACKGROUND_COLOR);
			TREE.displayTree();
			REPLACER_NODE = null;
		}, speed + 100);
	};

	const deleteNodeWithTwoChildren = (node, parent) => {
		REPLACER_NODE_TWO_CHILDREN = inOrderReplacer(node);
		REMOVE_NODE = node;
		if (!REPLACER_NODE_TWO_CHILDREN) throw new Error("Node with two children without parent.");
		TREE.displayTree();
		setTimeout(() => {
			deleteNode(REPLACER_NODE_TWO_CHILDREN.element);
			if (!parent) {
				root.element = REPLACER_NODE_TWO_CHILDREN.element;
				REPLACER_NODE_TWO_CHILDREN = root;
			} else {
				if (parent.left === node) {
					parent.left.element = REPLACER_NODE_TWO_CHILDREN.element;
					REPLACER_NODE_TWO_CHILDREN = parent.left;
				} else {
					parent.right.element = REPLACER_NODE_TWO_CHILDREN.element;
					REPLACER_NODE_TWO_CHILDREN = parent.right;
				}
			}
		}, speed + 200);
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
		if (!node) {
			alert("Element is not in the tree.");
			unhighlightNodesFn();
			return;
		}
		searchingNode = node;
		TREE.displayTree();
		const comparison = compareFn(value, node.element);
		if (comparison === 0) {
			highlightedNode = node;
			searchingNode = null;
			setTimeout(() => TREE.displayTree());
			return;
		} else if (comparison === -1) {
			setTimeout(() => {
				searchNode(value, node.left);
				console.log(node);
			}, speed);
		} else if (comparison === 1) {
			setTimeout(() => {
				searchNode(value, node.right);
				console.log(node);
			}, speed);
		} else {
			pathTraveled = [];
			searchingNode = null;
			alert("Element is not in the tree.");
		}
	};

	const displayTraverse = array => {
		if (!array) return;
		if (array.length === 1) {
			setTimeout(() => {
				TRAVERSE_NODE = array[0];
				TREE.displayTree();
				TRAVERSE_NODE = null;
			}, 1000);
			return;
		} else {
			setTimeout(() => {
				TRAVERSE_NODE = array[0];
				TREE.displayTree();
				displayTraverse(array.slice(1));
			}, 700);
		}
	};

	const traverse = (order = "Inorder", rootNode = root) => visit(rootNode, order);
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
		console.log(nodes);
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

			let nodeColor = pathTraveled.includes(node)
				? PATH_COLOR
				: node === searchingNode
				? "#ff4500"
				: node === highlightedNode
				? HIGHLIGHTED_NODE_COLOR
				: node === REMOVE_NODE
				? "red"
				: node === REPLACER_NODE_TWO_CHILDREN || node === REPLACER_NODE_ONE_CHILD
				? "orange"
				: node === TRAVERSE_NODE
				? "#1e90ff"
				: NODE_COLOR;
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
		addNodeNoHighlight,
		displayTraverse,
	};
};

function setup() {
	//createCanvas(800, 600);
	createCanvas(1400, 800);

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
	REMOVE_NODE = null;
	REPLACER_NODE_TWO_CHILDREN = null;
	REPLACER_NODE_ONE_CHILD = null;
	TREE.removeNode(+inputBox.value());
	//background(BACKGROUND_COLOR);
	//TREE.displayTree();
};

const searchNodeBtnFn = () => {
	if (!inputBox.value().match(/^\d+\.?\d*$/)) return;
	if (!TREE) return;
	else {
		unhighlightNodesFn();
		TREE.search(+inputBox.value());
		//if (!highlightedNode) alert("Element is not in the tree.");
		//TREE.displayTree();
	}
};

const resetTreeBtnFn = () => {
	TREE = null;
	pathTraveled = [];
	highlightedNode = null;
	REMOVE_NODE = null;
	REPLACER_NODE_TWO_CHILDREN = null;
	REPLACER_NODE_ONE_CHILD = null;
	TRAVERSE_NODE = null;
	background(BACKGROUND_COLOR);
};

const unhighlightNodesFn = () => {
	if (!TREE) return;
	//console.log(pathTraveled, highlightedNode, searchingNode)
	pathTraveled = [];
	highlightedNode = null;
	searchingNode = null;
	REMOVE_NODE = null;
	REPLACER_NODE_TWO_CHILDREN = null;
	REPLACER_NODE_ONE_CHILD = null;
	TRAVERSE_NODE = null;
	TREE.displayTree();
};

const RandomFillTreeBtnFn = () => {
	TREE = binaryTree(6);
	TREE.addNodeNoHighlight(2);
	TREE.addNodeNoHighlight(9);
	TREE.addNodeNoHighlight(1);
	TREE.addNodeNoHighlight(4);
	TREE.addNodeNoHighlight(8);
	TREE.addNodeNoHighlight(13);
	TREE.addNodeNoHighlight(18);
	background(BACKGROUND_COLOR);
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

function draw() {
	//TREE.displayTree()
}
