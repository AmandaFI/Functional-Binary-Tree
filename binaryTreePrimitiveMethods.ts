import { forEachNode, visitNodes } from "./binaryTreeIterationMethods";
import { ChildSideType, CompareFnType, NodeKindType, NodeType, sortedNodesType } from "./binaryTreeTypes";

// {} allows all types except undefined and null
export const defineCompareFn = <T extends {}>(compareFn?: CompareFnType<T>) => {
	return compareFn
		? compareFn
		: (firstValue: T, secondValue: T) => (firstValue === secondValue ? 0 : firstValue > secondValue ? 1 : -1);
};

export const createNode = <T extends {}>(
	element: T,
	parent: NodeType<T> | null = null,
	parentSide: ChildSideType | null = null
): NodeType<T> => {
	const level = parent ? parent.level + 1 : 0;
	const levelPosition = !parent ? 1 : parentSide === "left" ? 2 * parent.levelPosition - 1 : 2 * parent.levelPosition;
	return { element, left: null, right: null, parent, level, levelPosition, parentSide };
};

export const editNode = <T extends {}>(
	node: NodeType<T>,
	element: T,
	leftChild: NodeType<T> | null,
	rightChild: NodeType<T> | null,
	parent?: NodeType<T>
) => {
	node.element = element;
	node.left = leftChild;
	node.right = rightChild;
	node.parent = parent === undefined ? node.parent : parent;
};

export const isLeaf = <T extends {}>(node: NodeType<T>) => !node.left && !node.right;
export const hasBothChildren = <T extends {}>(node: NodeType<T>) => (node.left && node.right ? true : false);
export const hasOnlyChild = <T extends {}>(node: NodeType<T>) => !isLeaf(node) && !hasBothChildren(node);

export const rightMostElement = <T extends {}>(node: NodeType<T>): T =>
	isLeaf(node) || !node.right ? node.element : rightMostElement(node.right);

export const leftMostElement = <T extends {}>(node: NodeType<T>): T =>
	isLeaf(node) || !node.left ? node.element : leftMostElement(node.left);

export const inorderPredecessor = <T extends {}>(node: NodeType<T>): NodeType<T> | false => {
	if (node.parent && node.parent.left === node) return node.parent;
	else if (node.parent) return inorderPredecessor(node.parent);
	return false;
};

export const inorderSuccessor = <T extends {}>(node: NodeType<T>): NodeType<T> | false => {
	if (node.right) {
		node = node.right;
		while (node.left) node = node.left;
		return node;
	}
	return false;
};

export const treeHeight = <T extends {}>(rootNode: NodeType<T> | null, currentHeight = 0): number => {
	if (!rootNode) return currentHeight;
	const leftHeight = treeHeight(rootNode.left, currentHeight + 1);
	const rightHeight = treeHeight(rootNode.right, currentHeight + 1);
	return Math.max(leftHeight, rightHeight);
};

export const nodeCount = <T extends {}>(node: NodeType<T>, kind?: NodeKindType): number => {
	if (!kind) return visitNodes(node).length;
	const kindCheckFn = kind === "Leaf" ? isLeaf : kind === "OneChild" ? hasOnlyChild : hasBothChildren;
	let count = 0;
	forEachNode(node => {
		if (kindCheckFn(node)) count++;
	}, node);
	return count;
};

export const isBinarySearchTree = <T extends {}>(rootNode: NodeType<T> | null): boolean => {
	if (!rootNode) return true;
	if (rootNode.left && rootNode.left.element >= rootNode.element) return false;
	else if (rootNode.right && rootNode.right.element <= rootNode.element) return false;
	return true && isBinarySearchTree(rootNode.left) && isBinarySearchTree(rootNode.right);
};

export const replaceRoot = <T extends {}>(root: NodeType<T>, replacer: NodeType<T>) => {
	root.element = replacer.element;
	root.left = replacer.left;
	root.right = replacer.right;
};

export const connectNodes = <T extends {}>(parent: NodeType<T>, child: NodeType<T>, childPosition: ChildSideType) => {
	child.parent = parent;
	child.parentSide = childPosition;
	parent[childPosition] = child;
};

export const lowestCommonAncestor = <T extends {}>(
	firstElement: T,
	secondElement: T,
	compareFn: CompareFnType<T>,
	node: NodeType<T> | null
): NodeType<T> | false => {
	// if (!node || !searchNode(firstElement) || !searchNode(secondElement)) return false;    // considering that the elements may not be in the tree
	if (!node) return false;

	const firstCmp = compareFn(firstElement, node.element);
	const secondCmp = compareFn(secondElement, node.element);

	if (firstCmp === -1 && secondCmp === -1) return lowestCommonAncestor(firstElement, secondElement, compareFn, node.left);
	else if (firstCmp === 1 && secondCmp === 1) return lowestCommonAncestor(firstElement, secondElement, compareFn, node.right);
	else if (firstCmp === 0 || secondCmp === 0 || (firstCmp === 1 && secondCmp === -1) || (firstCmp === -1 && secondCmp === 1))
		return node;
	else return false;
};

export const elementsSmallerThan = <T extends {}>(value: T, node: NodeType<T>, compareFn: CompareFnType<T>): Array<T> => {
	const comparison = compareFn(node.element, value)
	if (comparison === 1) {
		if (isLeaf(node) || !node.left) return []
		else return elementsSmallerThan(value, node.left, compareFn)
	}
	else if (comparison === 0) {
		return node.left ? elementsSmallerThan(value, node.left, compareFn) : []
	}
	else {
		return [...(node.left ? elementsSmallerThan(value, node.left, compareFn) : []), node.element, ...(node.right ? elementsSmallerThan(value, node.right, compareFn): [])]
	}
}

export const elementsGreaterThan = <T extends {}>(value: T, node: NodeType<T>, compareFn: CompareFnType<T>): Array<T> => {
	const comparison = compareFn(node.element, value)
	if (comparison === -1) {
		if (isLeaf(node) || !node.right) return []
		else return elementsGreaterThan(value, node.right, compareFn)
	}
	else if (comparison === 0) {
		return node.right ? elementsGreaterThan(value, node.right, compareFn) : []
	}
	else {
		return [...(node.left ? elementsGreaterThan(value, node.left, compareFn) : []), node.element, ...(node.right ? elementsGreaterThan(value, node.right, compareFn): [])]
	}
}

export const elementsBetween = <T extends {}>(leftValue: T, rightValue: T, node: NodeType<T>, compareFn: CompareFnType<T>): Array<T> => {
	const greatherThanLeft = elementsGreaterThan(leftValue, node, compareFn)
	const smallerThanRight = elementsSmallerThan(rightValue, node, compareFn)
	return greatherThanLeft.filter(el => smallerThanRight.includes(el));
}

export const updateSubtreeLevels = <T extends {}>(node: NodeType<T>, newLevel: number, newLevelPosition: number) => {
	if (!node) return;

	node.level = newLevel;
	node.levelPosition = newLevelPosition;

	if (node.left) updateSubtreeLevels(node.left, newLevel + 1, 2 * newLevelPosition - 1);
	if (node.right) updateSubtreeLevels(node.right, newLevel + 1, 2 * newLevelPosition);
};

export const sortNodesByLevel = <T extends {}>(root: NodeType<T>) => {
	const orderedNodes = visitNodes(root);

	const sortedNodes: sortedNodesType<T> = {};
	orderedNodes.forEach(node => {
		if (node.level.toString() in sortedNodes) sortedNodes[node.level.toString()].push(node as NodeType<T>);
		else sortedNodes[node.level.toString()] = [node as NodeType<T>];
	});

	return sortedNodes;
};

// ( 6 ( 2 ( 1 ) ( 4 ( 3 ) ) ) ( 9 ( 8 ) ( 13 ( 18 ) ) ) )
export const displayTreeInline = <T extends {}>(node: NodeType<T> | null, tree: string = "") => {
	if (!node) return tree;
	tree += " ( " + node.element + displayTreeInline(node.left, tree) + displayTreeInline(node.right, tree) + " )";
	return tree;
};

// 	[ (6) ]
//  [ (2) (9) ]
//  [ (1) (4) | (8) (13) ]
//  [ () () | (3) () | () () | () (18) ]
export const displayTreePyramid = <T extends {}>(node: NodeType<T>) => {
	const levelSortedNodes = sortNodesByLevel<T>(node);
	const levels = Object.keys(levelSortedNodes);
	let matrix: T[][] | null[][] = [];
	[...Array(levels.length)].forEach((el, index) => {
		matrix[index] = [...Array(2 ** index)].map(() => null);
	});

	Object.keys(levelSortedNodes).forEach(level => {
		levelSortedNodes[level].forEach((node: NodeType<T>) => {
			matrix[+level][node.levelPosition - 1] = node.element;
		});
	});

	matrix.forEach((row: T[] | null[]) => {
		let printRow = "[ ";
		row.forEach((col: T | null, index) => {
			if (!col) printRow += index % 2 !== 0 && index !== row.length - 1 ? "- | " : "- ";
			else printRow += index % 2 !== 0 && index !== row.length - 1 ? "(" + col + ") | " : "(" + col + ") ";
		});
		console.log(printRow + "]");
	});
};

let spaceIncrement = 5;
export const displayTreeSideways = <T extends {}>(node: NodeType<T> | null, spaces = 0) => {
	if (node == null) return;
	spaces += spaceIncrement;
	displayTreeSideways(node.right, spaces);
	[...Array(spaces - spaceIncrement)].forEach(() => process.stdout.write(" "));
	console.log(node.element);
	displayTreeSideways(node.left, spaces);
};
