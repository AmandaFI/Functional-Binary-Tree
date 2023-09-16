// Display algorithm:
// Each node belongs to a level. Levels encrease from top to bottom. Root is in level 1.
// Each level accommodates at minimum 1 node and maximun 2^(level - 1) nodes. (if the root level was considered 0, each level would accommodate 2^level)
// Each note has a specific position in the level that it belongs. Tha position is determined by its parent position.
// The spacing between nodes in a given level is calculated by the canvas width divided by the maximun number of nodes that the level accommodates.
// The spacing between levels is calculated by the canvas height divided by the number of levels in the tree.

let TREE = null;
let NODE_RADIUS = 30;
let NODE_COLOR = 80;
let EDGE_COLOR = 0;
let ELEMENT_COLOR = 255;
let inputBox, addBtn, deleteBtn, searchBtn;

const binaryTree = (rootElement, compareFn) => {
	if ((typeof rootElement === "object" && !compareFn) || typeof rootElement === "function")
		throw new Error("Unable to sort tree.");

	const createNode = (element, parentPos, parent = null, x = null, y = null) => {
		const level = parent ? parent.level + 1 : 1;
		let levelPosition = 0;
		if (!parent) levelPosition = 1;
		else if (parent.levelPosition === 1) {
			if (parentPos === "left") levelPosition = 1;
			else if (parentPos === "right") levelPosition = parent.levelPosition + 1;
			else throw new Error("Child position unknow.");
		} else {
			if (parentPos === "left") levelPosition = parent.levelPosition + (parent.levelPosition - 1);
			else if (parentPos === "right") levelPosition = 2 * parent.levelPosition;
			else throw new Error("Child position unknow.");
		}
		return { element, left: null, right: null, parent, x, y, level, levelPosition };
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

	const validate = (rootNode = root) => {
		if (!rootNode) return true;
		if (rootNode.left && rootNode.left.element >= rootNode.element) return false;
		else if (rootNode.right && rootNode.right.element <= rootNode.element) return false;
		return true && validate(rootNode.left) && validate(rootNode.right);
	};

	const addNode = (element, node = root) => {
		console.log("adicionando node");
		console.log(compareFn(element, node.element));
		if (element === node.element) return;
		if (compareFn(element, node.element) === -1) {
			if (node.left) addNode(element, node.left);
			else node.left = createNode(element, "left", node);
		} else if (compareFn(element, node.element) === 1) {
			if (node.right) addNode(element, node.right);
			else node.right = createNode(element, "right", node);
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

	const deleteLeafNode = (element, parent) => {
		if (!parent) throw new Error("Root deletion not allowed.");
		if (parent.left.element === element) parent.left = null;
		else parent.right = null;
	};

	const deleteNodeWithOneChild = (node, parent) => {
		const replacerNode = node.left ? node.left : node.right;
		if (!parent) root.element = replacerNode.element;
		else {
			if (parent.left.element === node.element) parent.left = replacerNode;
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
		if (element === root.element && isLeaf(root)) throw new Error("Root deletion not allowed.");
		if (!node) return false;

		if (node.element === element) {
			if (!node.parent && node !== root) throw new Error(`Can not delete node with no parent.`);
			if (isLeaf(node)) deleteLeafNode(element, node.parent);
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

	const recursiveMap = ([currentNode, ...rest], fn, index = 0) => {
		if (!currentNode) return [];

		return [fn(currentNode.element, index), ...recursiveMap(rest, fn, index + 1)];
	};

	const recursiveFilter = ([currentNode, ...rest], fn, index = 0) => {
		if (!currentNode) return [];
		const fnResult = fn(currentNode.element, index) ? [currentNode.element] : [];
		return [...fnResult, ...recursiveFilter(rest, fn, index + 1)];
	};

	const recursiveReduce = (array, fn, acc, index = 0) => {
		if (array.length === 0) return acc;
		if (acc === undefined) [acc.element, ...array] = array;
		return recursiveReduce(array.slice(1), fn, fn(acc, array[0].element, index + 1), index + 1);
	};

	const mapTree = (mapFn, rootNode = root, order = "Inorder") => {
		const orderedNodes = visit(rootNode, order);
		return recursiveMap(orderedNodes, mapFn);
	};

	const filterTree = (filterFn, rootNode = root, order = "Inorder") => {
		const orderedNodes = visit(rootNode, order);
		return recursiveFilter(orderedNodes, filterFn);
	};

	const reduce = (fn, acc = undefined, rootNode = root, order = "Inorder") => {
		const orderedNodes = visit(rootNode, order);
		return recursiveReduce(orderedNodes, fn, acc);
	};

	const forEach = (fn, rootNode = root, order = "Inorder") => {
		const orderedNodes = visit(rootNode, order);
		for (let [index, node] of orderedNodes.entries()) fn(node.element, index);
	};

	const nodeForEach = (fn, rootNode = root, order = "Inorder") => {
		const orderedNodes = visit(rootNode, order);
		for (let [index, node] of orderedNodes.entries()) fn(node, index);
	};

	const nodeCount = (node = root, kind = undefined) => {
		if (!kind) return visit(node).length;
		let kindCheckFn;
		switch (kind) {
			case "Leaf":
				kindCheckFn = isLeaf;
				break;
			case "OneChild":
				kindCheckFn = hasOnlyOneChild;
				break;
			case "TwoChildren":
				kindCheckFn = hasTwoChildren;
				break;
			default:
				throw new Error("Unknown node kind.");
		}
		let count = 0;
		nodeForEach(node => {
			if (kindCheckFn(node)) count++;
		});
		return count;
	};

	const searchNode = (value, node = root) => {
		const comparison = compareFn(value, node.element);
		if (comparison === 0) return node;
		if (comparison === -1 && node.left) return searchNode(value, node.left);
		if (comparison === 1 && node.right) return searchNode(value, node.right);
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

	setNodesPosition = () => {
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
		setNodesPosition();
		nodes = visit(root);
		nodes.forEach(node => {
			if (node.left) {
				stroke(EDGE_COLOR);
				line(node.x, node.y, node.left.x, node.left.y);
			}

			if (node.right) {
				stroke(EDGE_COLOR);
				line(node.x, node.y, node.right.x, node.right.y);
			}
			fill(NODE_COLOR);
			noStroke();
			circle(node.x, node.y, NODE_RADIUS);
			stroke(255);
			fill(ELEMENT_COLOR);
			text(node.element, node.x, node.y);
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
		mapTree,
		filterTree,
		forEach,
		reduce,
		inOrderReplacer,
		validate,
		calcHeight,
		createNode,
		inOrderReplacer,
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

	background(220);

	// inputBox = createInput("");
	// inputBox.position(5, 5);
	// inputBox.size(50);
	// //inputBox.input(myInputEvent);
	// addBtn = createButton("Add");
	// addBtn.position(65, 5);
	// addBtn.mousePressed(addNodeBtnFn);
	// delBtn = createButton("Delete");
	// delBtn.position(105, 5);
	// delBtn.mousePressed(deleteNodeBtnFn);
	// searchBtn = createButton("Search");
	// searchBtn.position(160, 5);
	// searchBtn.mousePressed(searchNodeBtnFn);

	TREE = binaryTree(10);
	TREE.add(5);
	TREE.add(1);
	TREE.add(7);
	TREE.add(6);
	TREE.add(8);
	TREE.add(9);
	TREE.add(15);
	TREE.add(13);
	TREE.add(12);
	TREE.add(11);
	TREE.add(17);
	noLoop();
}

const addNodeBtnFn = () => {
	if (inputBox.value() === "") return;
	if (!TREE) TREE = binaryTree(inputBox.value());
	else TREE.add(+inputBox.value());
	background(220);
	TREE.displayTree();
};

const deleteNodeBtnFn = () => {
	if (inputBox.value() === "") return;
	if (!TREE) TREE = binaryTree(inputBox.value());
	else TREE.removeNode(+inputBox.value());
	background(220);
	TREE.displayTree();
};

const searchNodeBtnFn = () => {
	if (inputBox.value() === "") return;
	if (!TREE) TREE = binaryTree(+inputBox.value());
	else {
		const result = TREE.search(inputBox.value());
		alert(result);
	}
};

function draw() {
	TREE.displayTree(); // only when testing with noLoop
}
