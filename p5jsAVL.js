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
	CHECKING_BALANCE: "#fff300",
	BALANCING: "#A600FF",
};

const coloredNodes = {
	HIGHLIGHTED: null,
	SEARCHING: null,
	REMOVING: null,
	REPLACER_FOR_ONE_C: null,
	REPLACER_FOR_TWO_C: null,
	TRAVERSING: null,
	CURRENT_GENERATOR: null,
	REMOVED_RELATIVE: null,
	CHECK_BALANCE: null,
	NEEDS_BALANCE: null,
	BALANCE: [],
};

let displayedText = "";
let rotationText = "";
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
					PATH_TRAVELED = [];
					setTimeout(() => {
						checkAncestorsBalance(coloredNodes.HIGHLIGHTED);
						actionInProgress = false;
					}, DELAY);
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
			const new_node = createNode(element, side, node);
			node[side] = new_node;
			visitedTree = null;
			checkAncestorsBalance(new_node);
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

	const editNode = (node, element, leftChild, rightChild, parent) => {
		node.element = element;
		node.left = leftChild;
		node.right = rightChild;
		node.parent = parent === undefined ? node.parent : parent;
	};

	const connectNodes = (parent, child, childPosition) => {
		child.parent = parent;
		child.parentSide = childPosition;
		parent[childPosition] = child;
	};

	const treeHeight = (rootNode, currentHeight = 0) => {
		if (!rootNode) return currentHeight;
		const leftHeight = treeHeight(rootNode.left, currentHeight + 1);
		const rightHeight = treeHeight(rootNode.right, currentHeight + 1);
		return Math.max(leftHeight, rightHeight);
	};

	const deleteLeafNode = (node, parent) => {
		if (!parent) return;
		coloredNodes.REMOVING = node;
		TREE.displayTree();
		coloredNodes.REMOVED_RELATIVE = parent;

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
			coloredNodes.REMOVED_RELATIVE = root;
		} else {
			coloredNodes.REPLACER_FOR_ONE_C.parent = parent;
			coloredNodes.REMOVED_RELATIVE = parent;
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
				coloredNodes.REMOVED_RELATIVE = root;
			} else {
				const side = parent.left === node ? "left" : "right";
				parent[side].element = coloredNodes.REPLACER_FOR_TWO_C.element;
				coloredNodes.REPLACER_FOR_TWO_C = parent[side];
				coloredNodes.REMOVED_RELATIVE = parent[side];
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

	const calculateBalanceFactor = node => {
		if (!node) return 0;
		return treeHeight(node.left) - treeHeight(node.right);
	};

	const isBalanced = node => {
		const balanceFactor = calculateBalanceFactor(node);
		if (balanceFactor === -1 || balanceFactor === 0 || balanceFactor === 1) return true;
		return false;
	};

	const checkAncestorsBalance = node => {
		if (coloredNodes.HIGHLIGHTED !== null) coloredNodes.HIGHLIGHTED = null;
		if (coloredNodes.REPLACING !== null) coloredNodes.REPLACING = null;
		if (node !== null) {
			coloredNodes.CHECK_BALANCE = node;
			TREE.displayTree();
			if (!isBalanced(node)) {
				console.log(`Node ${node.element} needs balance.`);
				coloredNodes.NEEDS_BALANCE = node;
				setTimeout(() => {
					TREE.displayTree();
					setTimeout(() => {
						balance(node);
						setTimeout(() => checkAncestorsBalance(node.parent), DELAY + 3000);
					}, DELAY + 200);
				}, DELAY);
			} else {
				setTimeout(() => checkAncestorsBalance(node.parent), DELAY + 300);
			}
		}
	};

	const choseRotation = node => {
		const balanceFactor = calculateBalanceFactor(node);

		if (balanceFactor > 1) {
			if (calculateBalanceFactor(node.left) === 1) return "LL";
			return "LR";
		} else if (balanceFactor < -1) {
			if (calculateBalanceFactor(node.right) === -1) return "RR";
			return "RL";
		} else return null;
	};

	const rotateRight = node => {
		if (node === null) throw new Error("Impossible to perform LL rotation with 'null' node.");
		actionInProgress = true;

		coloredNodes.CHECK_BALANCE = null;
		coloredNodes.NEEDS_BALANCE = null;
		coloredNodes.BALANCE = [node, node.parent, node.left];
		TREE.displayTree();
		const { element, parent, left: leftChild } = node;
		if (!parent) throw new Error("Impossible to execute LL rotation.");

		const rightChild = createNode(parent.element, "right", parent);

		if (parent.right) {
			connectNodes(rightChild, parent.right, "right");
			updateSubtreeLevels(parent.right, rightChild.level + 1, 2 * rightChild.levelPosition);
		}

		if (node.right) {
			connectNodes(rightChild, node.right, "left");
			updateSubtreeLevels(node.right, rightChild.level + 1, 2 * rightChild.levelPosition - 1);
		}

		editNode(parent, element, leftChild, rightChild);

		if (leftChild) {
			connectNodes(parent, leftChild, "left");
			updateSubtreeLevels(leftChild, leftChild.level - 1, 2 * parent.levelPosition - 1);
		}

		visitedTree = null;
		coloredNodes.BALANCE = [parent, leftChild, rightChild];
	};

	const rotateLeft = node => {
		if (node === null) throw new Error("Impossible to perform RR rotation with 'null' node.");
		actionInProgress = true;

		coloredNodes.CHECK_BALANCE = null;
		coloredNodes.NEEDS_BALANCE = null;
		coloredNodes.BALANCE = [node, node.parent, node.right];
		TREE.displayTree();

		const { element, parent, right: rightChild } = node;
		if (!parent) throw new Error("Impossible to execute RR rotation.");

		const leftChild = createNode(parent.element, "left", parent);

		if (parent.left) {
			connectNodes(leftChild, parent.left, "left");
			updateSubtreeLevels(parent.left, leftChild.level + 1, 2 * leftChild.levelPosition - 1);
		}

		if (node.left) {
			connectNodes(leftChild, node.left, "right");
			updateSubtreeLevels(node.left, leftChild.level + 1, 2 * leftChild.levelPosition);
		}

		editNode(parent, element, leftChild, rightChild);

		if (rightChild) {
			connectNodes(parent, rightChild, "right");
			updateSubtreeLevels(rightChild, parent.level + 1, 2 * parent.levelPosition);
		}

		visitedTree = null;
		coloredNodes.BALANCE = [parent, leftChild, rightChild];
	};

	const rotateLeftRight = node => {
		if (node === null) throw new Error("Impossible to perform rotation LR with 'null' node.");

		rotateLeft(node.right);

		setTimeout(() => {
			TREE.displayTree();
			setTimeout(() => {
				rotateRight(node);
				setTimeout(() => {
					TREE.displayTree();
					actionInProgress = false;
				}, 1000);
			}, 1000);
		}, 1000);
	};

	const rotateRightLeft = node => {
		if (node === null) throw new Error("Impossible to perform rotation RL with 'null' node.");

		rotateRight(node.left);
		setTimeout(() => {
			TREE.displayTree();
			setTimeout(() => {
				rotateLeft(node);
				setTimeout(() => {
					TREE.displayTree();
					actionInProgress = false;
				}, 1000);
			}, 1000);
		}, 1000);
	};

	const balance = node => {
		const rotation = choseRotation(node);
		console.log(`Executing ${rotation} rotation...`);
		displayedText = rotation;
		rotationText = "Rotation: ";
		switch (rotation) {
			case "LL":
				rotateRight(node.left);
				setTimeout(() => {
					TREE.displayTree();
					actionInProgress = false;
				}, 1000);

				break;
			case "RL":
				rotateRightLeft(node.right);
				break;
			case "RR":
				rotateLeft(node.right);
				setTimeout(() => {
					TREE.displayTree();
					actionInProgress = false;
				}, 1000);
				break;
			case "LR":
				rotateLeftRight(node.left);
				break;
			default:
				throw new Error("No rotation needed.");
		}
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
		else if (coloredNodes.BALANCE.includes(node)) return colors.BALANCING;
		return colors.EDGE;
	};

	const nodeColor = node => {
		if (PATH_TRAVELED.includes(node)) return colors.PATH;
		else if (coloredNodes.BALANCE.includes(node)) return colors.BALANCING;
		switch (node) {
			case coloredNodes.NEEDS_BALANCE:
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
			case coloredNodes.CHECK_BALANCE:
				return colors.CHECKING_BALANCE;
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
		fill(colors.BALANCING);
		textStyle(BOLD);
		textSize(28);
		text(rotationText, 1000, 50, 50, 30);
		text(displayedText, 1130, 50, 50, 30);
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

	const add = element => addNode(element);
	const removeNode = element => {
		deleteNode(element);

		setTimeout(() => {
			TREE.displayTree();
			coloredNodes.REPLACING = null;
			coloredNodes.REMOVING = null;
			checkAncestorsBalance(coloredNodes.REMOVED_RELATIVE);
		}, 1000);
	};
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
	coloredNodes.BALANCE = [];
	coloredNodes.CHECK_BALANCE = null;
	coloredNodes.HIGHLIGHTED = null;
	coloredNodes.SEARCHING = null;
	coloredNodes.REMOVING = null;
	coloredNodes.REPLACER_FOR_TWO_C = null;
	coloredNodes.REPLACER_FOR_ONE_C = null;
	coloredNodes.TRAVERSING = null;
	coloredNodes.CURRENT_GENERATOR = null;
	displayedText = "";
	rotationText = "";
	REMOVED_RELATIVE = null;
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

const button = (title, x, y, pressedFn) => {
	const btn = createButton(title);
	btn.position(x, y);
	btn.mousePressed(pressedFn);
	return btn;
};

function setup() {
	//createCanvas(800, 600);
	createCanvas(1200, 800);
	//createCanvas(1400, 800);

	background(colors.BACKGROUND);

	inputBox = createInput("");
	inputBox.position(5, 5);
	inputBox.size(57);

	addBtn = button("Add", 72, 5, addNodeBtnFn);
	delBtn = button("Delete", 114, 5, deleteNodeBtnFn);
	searchBtn = button("Search", 171, 5, searchNodeBtnFn);
	resetBtn = button("Reset", 5, 30, resetTreeBtnFn);
	unhighlightBtn = button("Unhighlight", 58, 30, unhighlightNodesFn);

	inorderTraverseBtn = button("Inorder Traverse", 826, 5, inorderTraverseBtnFn);
	preorderTraverseBtn = button("Preorder Traverse", 943, 5, preorderTraverseBtnFn);
	postOrdeTraverseBtn = button("Postorder Traverse", 1068, 5, postorderTraverseBtnFn);
}

function draw() {}
