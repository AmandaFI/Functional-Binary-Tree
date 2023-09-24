// print
// encontrar a maior arvore balanceada 'dentro' da arvore
// using cached inOrderTraverse result
// FAZER TESTES DE TUDO
//  o p5.js
// arrumar reduce

// -----------------------------------------------OBS------------------------------------------------------------------
// coisas que querem iterar pelos nodes utilizam o visit e os que querem iterar pelos elements utilizam o iterator
// nada impediria de ter 2 iterators, um que retornasse nodes array e outro que retornasse elements array
// --------------------------------------------------------------------------------------------------------------------

// https://www.freecodecamp.org/news/binary-search-tree-traversal-inorder-preorder-post-order-for-bst/

// classes em formato de funçaõ são uma forma de ter private em metodos e atributos
// python, javascript, entre outras o private não "existe" realmente

// incluir height como property do node
// separa binaryTree em duas funções e reutilizar a primeira para AVL
// criar novo tipo de Node, incluir balance factor ou calcular ele toda hora usando height ?

type ChildSideType = "left" | "right";
type OrderType = "Inorder" | "Preorder" | "Postorder";
type NodeKindType = "Leaf" | "OneChild" | "BothChildren";

type NodeType<T extends {}> = {
	element: T;
	left: NodeType<T> | null;
	right: NodeType<T> | null;
	parent: NodeType<T> | null;
	level: number; // depth
	levelPosition: number;
	parentSide: ChildSideType | null;
};

type CompareFnReturnType = -1 | 0 | 1;
type CompareFnType<T extends {}> = (leftElement: T, rightElement: T) => CompareFnReturnType;
type MapFnType<T> = (element: T, index?: number) => any;
type FilterFnType<T> = (element: T, index?: number) => boolean;
type ForEachFnType<T> = (element: T, index?: number) => void;
type NodeForEachFnType<T extends {}> = (node: NodeType<T>, index?: number) => void;
type ReduceFnType<T> = (acc: any, element: T, index?: number) => any;

type NodeKindFn<T extends {}> = (node: NodeType<T>) => boolean;
type sortedNodesType<T extends {}> = {
	[level: string]: NodeType<T>[];
};

const binaryTreeIterationMethods = <T extends {}>(root: NodeType<T>) => {
	const visitNodes = (node: NodeType<T> | null = root, order: OrderType = "Inorder"): NodeType<T>[] => {
		if (!node) return [];
		const leftChildVisitResult = visitNodes(node.left, order);
		const rightChildVisitResult = visitNodes(node.right, order);
		switch (order) {
			case "Inorder":
				return [...leftChildVisitResult, node, ...rightChildVisitResult];
			case "Preorder":
				return [node, ...leftChildVisitResult, ...rightChildVisitResult];
			case "Postorder":
				return [...leftChildVisitResult, ...rightChildVisitResult, node];
			default:
				const _exhaustiveCheck: never = order;
				throw new Error("Unknown order.");
		}
	};

	// yield* transfere a chamada do next para outro generator, ou seja, o outro generator que deve atender o next e fazer o yield de algo
	// function* iterator(order: OrderType = "Inorder", node = root): Iterator<T> {
	function* visitElements(order: OrderType = "Inorder", node = root): Generator<T, undefined, undefined> {
		if (order === "Preorder") yield node.element;
		if (node.left) yield* visitElements(order, node.left);
		if (order === "Inorder") yield node.element;
		if (node.right) yield* visitElements(order, node.right);
		if (order === "Postorder") yield node.element;
	}

	const map = (fn: MapFnType<T>, order: OrderType = "Inorder"): ReturnType<typeof fn>[] => {
		const recursiveMap = ([currentElement, ...rest]: T[], index = 0): ReturnType<typeof fn>[] => {
			if (!currentElement) return [];
			return [fn(currentElement, index), ...recursiveMap(rest, index + 1)];
		};

		return recursiveMap([...visitElements(order)]);
	};

	const filter = (fn: FilterFnType<T>, order: OrderType = "Inorder"): T[] => {
		const recursiveFilter = ([currentElement, ...rest]: T[], index = 0): T[] => {
			if (!currentElement) return [];
			const fnResult = fn(currentElement, index) ? [currentElement] : [];
			return [...fnResult, ...recursiveFilter(rest, index + 1)];
		};

		return recursiveFilter([...visitElements(order)]);
	};

	// testar reduce
	const reduce = (fn: ReduceFnType<T>, acc: any = undefined, order: OrderType = "Inorder"): ReturnType<typeof fn> => {
		const recursiveReduce = (array: T[], acc: any = undefined, index = 0): ReturnType<typeof fn> => {
			if (array.length === 0) return acc;
			if (acc === undefined) [acc, ...array] = array;
			return recursiveReduce(array.slice(1), fn(acc, array[0], index + 1), index + 1);
		};
		return recursiveReduce([...visitElements(order)], fn, acc);
	};

	const forEachElement = (fn: ForEachFnType<T>): void => {
		for (let [index, element] of [...visitElements()].entries()) fn(element, index);
	};

	const forEachNode = (fn: NodeForEachFnType<T>, rootNode: NodeType<T> = root, order: OrderType = "Inorder"): void => {
		const orderedNodes = visitNodes(rootNode, order);
		for (let [index, node] of orderedNodes.entries()) fn(node, index);
	};

	const traverse = (order: OrderType = "Inorder") => [...visitElements(order)];

	return {
		[Symbol.iterator]: () => visitElements(),
		visitNodes,
		map,
		filter,
		reduce,
		forEachElement,
		forEachNode,
		traverse,
	};
};

const basicBinaryTreeOperations = <T extends {}>(root: NodeType<T>, compareFn?: CompareFnType<T>) => {
	compareFn ??= (firstValue, secondValue) => (firstValue === secondValue ? 0 : firstValue > secondValue ? 1 : -1);

	const iterationMethods = binaryTreeIterationMethods(root);

	const isLeaf: NodeKindFn<T> = (node: NodeType<T>) => !node.left && !node.right;
	const hasBothChildren: NodeKindFn<T> = (node: NodeType<T>) => (node.left && node.right ? true : false);
	const hasOnlyChild: NodeKindFn<T> = (node: NodeType<T>) => !isLeaf(node) && !hasBothChildren(node);

	const rightMostElement = (node: NodeType<T> = root): T =>
		isLeaf(node) || !node.right ? node.element : rightMostElement(node.right);

	const leftMostElement = (node: NodeType<T> = root): T =>
		isLeaf(node) || !node.left ? node.element : leftMostElement(node.left);

	const inorderPredecessor = (node: NodeType<T>): NodeType<T> | false => {
		if (node.parent && node.parent.left === node) return node.parent;
		else if (node.parent) return inorderPredecessor(node.parent);
		return false;
	};

	const inorderSucessor = (node: NodeType<T>): NodeType<T> | false => {
		if (node.right) {
			node = node.right;
			while (node.left) node = node.left;
			return node;
		}
		return false;
	};

	const height = (rootNode: NodeType<T> | null = root, currentHeight = 0): number => {
		if (!rootNode) return currentHeight;
		const leftHeight = height(rootNode.left, currentHeight + 1);
		const rightHeight = height(rootNode.right, currentHeight + 1);
		return Math.max(leftHeight, rightHeight);
	};

	const nodeCount = (node: NodeType<T> = root, kind?: NodeKindType): number => {
		if (!kind) return iterationMethods.visitNodes(node).length;
		const kindCheckFn = kind === "Leaf" ? isLeaf : kind === "OneChild" ? hasOnlyChild : hasBothChildren;
		let count = 0;
		iterationMethods.forEachNode(node => {
			if (kindCheckFn(node)) count++;
		});
		return count;
	};

	const isBinarySearchTree = (rootNode: NodeType<T> | null = root): boolean => {
		if (!rootNode) return true;
		if (rootNode.left && rootNode.left.element >= rootNode.element) return false;
		else if (rootNode.right && rootNode.right.element <= rootNode.element) return false;
		return true && isBinarySearchTree(rootNode.left) && isBinarySearchTree(rootNode.right);
	};

	const lowestCommonAncestor = (firstElement: T, secondElement: T, node: NodeType<T> | null = root): NodeType<T> | false => {
		// if (!node || !searchNode(firstElement) || !searchNode(secondElement)) return false;    // considering that the elements may not be in the tree
		if (!node) return false;

		const firstCmp = compareFn!(firstElement, node.element);
		const secondCmp = compareFn!(secondElement, node.element);

		if (firstCmp === -1 && secondCmp === -1) return lowestCommonAncestor(firstElement, secondElement, node.left);
		else if (firstCmp === 1 && secondCmp === 1) return lowestCommonAncestor(firstElement, secondElement, node.right);
		else if (firstCmp === 0 || secondCmp === 0 || (firstCmp === 1 && secondCmp === -1) || (firstCmp === -1 && secondCmp === 1))
			return node;
		else return false;
	};

	const updateSubtreeLevels = (node: NodeType<T>, newLevel: number, newLevelPosition: number) => {
		if (!node) return;

		node.level = newLevel;
		node.levelPosition = newLevelPosition;

		if (node.left) updateSubtreeLevels(node.left, newLevel + 1, 2 * newLevelPosition - 1);
		if (node.right) updateSubtreeLevels(node.right, newLevel + 1, 2 * newLevelPosition);
	};

	const sortNodesByLevel = () => {
		const orderedNodes = iterationMethods.visitNodes();

		const sortedNodes: sortedNodesType<T> = {};
		orderedNodes.forEach(node => {
			if (node.level.toString() in sortedNodes) sortedNodes[node.level.toString()].push(node);
			else sortedNodes[node.level.toString()] = [node];
		});

		return sortedNodes;
	};

	// ( 6 ( 2 ( 1 ) ( 4 ( 3 ) ) ) ( 9 ( 8 ) ( 13 ( 18 ) ) ) )
	const displayTreeInline = (node: NodeType<T> | null = root, tree: string = "") => {
		if (!node) return tree;
		tree += " ( " + node.element + displayTreeInline(node.left, tree) + displayTreeInline(node.right, tree) + " )";
		return tree;
	};

	// 	[ (6) ]
	//  [ (2) (9) ]
	//  [ (1) (4) | (8) (13) ]
	//  [ () () | (3) () | () () | () (18) ]
	const displayTreePyramid = () => {
		const levelSortedNodes = sortNodesByLevel();
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

	return {
		compareFn,
		isLeaf,
		hasBothChildren,
		hasOnlyChild,
		rightMostElement,
		leftMostElement,
		inorderPredecessor,
		inorderSucessor,
		height,
		displayTreeInline,
		displayTreePyramid,
		nodeCount,
		updateSubtreeLevels,
		lowestCommonAncestor,
		...iterationMethods,
	};
};

// {} allows all types except undefined and null
const binaryTree = <T extends {}>(rootElement: T, compareFn?: CompareFnType<T>) => {
	if ((typeof rootElement === "object" && !compareFn) || typeof rootElement === "function")
		throw new Error("Unable to sort tree.");

	const createNode = (element: T, parent: NodeType<T> | null = null, parentSide: ChildSideType | null = null): NodeType<T> => {
		const level = parent ? parent.level + 1 : 0;
		const levelPosition = !parent ? 1 : parentSide === "left" ? 2 * parent.levelPosition - 1 : 2 * parent.levelPosition;
		return { element, left: null, right: null, parent, level, levelPosition, parentSide };
	};

	const root: NodeType<T> = createNode(rootElement);
	const operations = basicBinaryTreeOperations(root, compareFn);

	const addNode = (element: T, node: NodeType<T> = root) => {
		if (element === node.element) return;
		if (operations.compareFn!(element, node.element) === -1)
			node.left ? addNode(element, node.left) : (node.left = createNode(element, node, "left"));
		else if (operations.compareFn!(element, node.element) === 1)
			node.right ? addNode(element, node.right) : (node.right = createNode(element, node, "right"));
	};

	const deleteLeafNode = (element: T, parent: NodeType<T> | null) => {
		if (!parent) throw new Error("Root deletion not allowed.");
		parent.left?.element === element ? (parent.left = null) : (parent.right = null);
	};

	const deleteNodeWithOnlyChild = (node: NodeType<T>, parent: NodeType<T> | null) => {
		const replacerNode = node.left ? node.left : node.right;

		operations.updateSubtreeLevels(replacerNode!, node.level, node.levelPosition);

		if (!parent) root.element = replacerNode!.element;
		else {
			replacerNode!.parent = parent;
			parent.left?.element === node.element ? (parent.left = replacerNode) : (parent.right = replacerNode);
		}
	};

	const deleteNodeWithBothChildren = (node: NodeType<T>, parent: NodeType<T> | null) => {
		const replacer = node.right ? operations.inorderSucessor(node) : operations.inorderPredecessor(node);
		if (!replacer) throw new Error("Node with two children without parent.");
		deleteNode(replacer.element);
		if (!parent) root.element = replacer.element;
		else parent.left === node ? (parent.left.element = replacer.element) : (parent.right!.element = replacer.element);
	};

	const deleteNode = (element: T, node: NodeType<T> | null = root): boolean => {
		if (!node) return false;
		if (element === root.element && operations.isLeaf(root)) throw new Error("Root deletion not allowed.");

		if (node.element === element) {
			if (operations.isLeaf(node)) deleteLeafNode(element, node.parent);
			else if (operations.hasBothChildren(node)) deleteNodeWithBothChildren(node, node.parent);
			else deleteNodeWithOnlyChild(node, node.parent);
			return true;
		}
		if (operations.compareFn!(element, node.element) === -1) return deleteNode(element, node.left);
		else if (operations.compareFn!(element, node.element) === 1) return deleteNode(element, node.right);
		return false;
	};

	const searchNode = (value: T, node: NodeType<T> = root): NodeType<T> | false => {
		const comparison = operations.compareFn!(value, node.element);
		if (comparison === 0) return node;
		if (comparison === -1 && node.left) return searchNode(value, node.left);
		if (comparison === 1 && node.right) return searchNode(value, node.right);
		return false;
	};

	const add = (element: T) => addNode(element);
	const remove = (element: T) => deleteNode(element);
	const search = (element: T) => (searchNode(element) ? true : false);
	const height = (rootNode: NodeType<T> = root) => operations.height(rootNode);
	const min = (node: NodeType<T> = root): T => operations.leftMostElement(node);
	const max = (node: NodeType<T> = root): T => operations.rightMostElement(node);

	return {
		root,
		add,
		remove,
		search,
		min,
		max,
		height,
		display: operations.displayTreeInline,
		traverse: operations.traverse,
		[Symbol.iterator]: () => operations[Symbol.iterator], // Iterable returns a Iterator
		map: operations.map,
		filter: operations.filter,
		reduce: operations.reduce,
		forEach: operations.forEachElement,
		lowestCommonAncestor: operations.lowestCommonAncestor,
		pyramid: operations.displayTreePyramid,
	};
};

export { binaryTree };

//      6
//     /  \
//    2    9
//  /\     /\
// 1  4   8  13
//    /       \
//   3         18

const tree = binaryTree(6);
tree.add(2);
tree.add(1);
tree.add(4);
tree.add(3);
tree.add(9);
tree.add(8);
tree.add(13);
tree.add(18);

// let a = tree.lowestCommonAncestor(1, 23);
// const a = tree.lowestCommonAncestor(4, 6);
// const a = tree.lowestCommonAncestor(3, 4);
// const a = tree.lowestCommonAncestor(2, 4);
const a = tree.lowestCommonAncestor(3, 189);

console.log(a ? a.element : "no");

tree.pyramid();
tree.remove(1);

tree.remove(2);
tree.pyramid();

// tree.displayTreeInline();

// let a = tree.visitIterator();
// //console.log([...a]);
// console.log([...tree]);

// // // console.log(tree.validate(tree.root.right!));
// // tree.remove(10);
console.log(tree.traverse());
