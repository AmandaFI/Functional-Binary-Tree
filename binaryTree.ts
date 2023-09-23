// print
// encontrar a maior arvore balanceada 'dentro' da arvore
// using cached inOrderTraverse result
// FAZER TESTES DE TUDO
//  o p5.js
// arrumar reduce
// em algum lugar falta ajsutar o levelPosition após uma deleção, testar em displayTreePyramid

// -----------------------------------------------OBS------------------------------------------------------------------
// coisas que querem iterar pelos nodes utilizam o visit e os que querem iterar pelos elements utilizam o iterator
// nada impediria de ter 2 iterators, um que retornasse nodes array e outro que retornasse elements array
// --------------------------------------------------------------------------------------------------------------------

// https://www.freecodecamp.org/news/binary-search-tree-traversal-inorder-preorder-post-order-for-bst/

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

type ChildSideType = "left" | "right";
type OrderType = "Inorder" | "Preorder" | "Postorder";
type NodeKindType = "Leaf" | "OneChild" | "TwoChildren";
type NodeKindFn<T extends {}> = (node: NodeType<T>) => boolean;
type sortedNodesType<T extends {}> = {
	[level: string]: NodeType<T>[];
};

type MapFnType<T> = (element: T, index?: number) => any;
type FilterFnType<T> = (element: T, index?: number) => boolean;
type ForEachFnType<T> = (element: T, index?: number) => void;
type NodeForEachFnType<T extends {}> = (node: NodeType<T>, index?: number) => void;
type ReduceFnType<T> = (acc: any, element: T, index?: number) => any;

// {} allows all types except undefined and null
const binaryTree = <T extends {}>(rootElement: T, compareFn?: CompareFnType<T>) => {
	if ((typeof rootElement === "object" && !compareFn) || typeof rootElement === "function")
		throw new Error("Unable to sort tree.");

	const createNode = (element: T, parent: NodeType<T> | null = null, parentSide: ChildSideType | null = null): NodeType<T> => {
		const level = parent ? parent.level + 1 : 0;
		const levelPosition = !parent ? 1 : parentSide === "left" ? 2 * parent.levelPosition - 1 : 2 * parent.levelPosition;
		return { element, left: null, right: null, parent, level, levelPosition, parentSide };
	};

	compareFn ??= (firstValue, secondValue) => (firstValue === secondValue ? 0 : firstValue > secondValue ? 1 : -1);
	const root: NodeType<T> = createNode(rootElement);

	const isLeaf: NodeKindFn<T> = (node: NodeType<T>) => !node.left && !node.right;
	// const isLeaf = (node: NodeType<T>) => !(node.left || node.right);

	const hasTwoChildren: NodeKindFn<T> = (node: NodeType<T>) => (node.left && node.right ? true : false);

	const hasOnlyOneChild: NodeKindFn<T> = (node: NodeType<T>) => !isLeaf(node) && !hasTwoChildren(node);
	// (!node.left && node.right) || (node.left && !node.right);

	const nodeHeight = (rootNode: NodeType<T> | null = root, height = 0): number => {
		if (!rootNode) return height;
		const leftHeight = nodeHeight(rootNode.left, height + 1);
		const rightHeight = nodeHeight(rootNode.right, height + 1);
		return Math.max(leftHeight, rightHeight);
	};

	const validate = (rootNode: NodeType<T> | null = root): boolean => {
		if (!rootNode) return true;
		if (rootNode.left && rootNode.left.element >= rootNode.element) return false;
		else if (rootNode.right && rootNode.right.element <= rootNode.element) return false;
		return true && validate(rootNode.left) && validate(rootNode.right);
	};

	const rightMostElement = (node: NodeType<T> = root): T =>
		isLeaf(node) || !node.right ? node.element : rightMostElement(node.right);

	const leftMostElement = (node: NodeType<T> = root): T =>
		isLeaf(node) || !node.left ? node.element : leftMostElement(node.left);

	const ancestralReplacer = (node: NodeType<T>): NodeType<T> | false => {
		if (node.parent && node.parent.left === node) return node.parent;
		else if (node.parent) return ancestralReplacer(node.parent);
		return false;
	};

	const inOrderReplacer = (node: NodeType<T>): NodeType<T> | false => {
		if (node.right) {
			node = node.right;
			while (node.left) node = node.left;
			return node;
		} else {
			if (!node.parent) return false;
			return ancestralReplacer(node);
		}
	};

	const recalcLevel = (node: NodeType<T>) => {
		if (!node) return;
		if (node.left) {
			node.left.level = node.level + 1;
			node.left.levelPosition = 2 * node.levelPosition - 1;
			recalcLevel(node.left);
		}
		if (node.right) {
			node.right.level = node.level + 1;
			node.right.levelPosition = 2 * node.levelPosition;
			recalcLevel(node.right);
		}
	};

	const addNode = (element: T, node: NodeType<T> = root) => {
		if (element === node.element) return;
		if (compareFn!(element, node.element) === -1)
			node.left ? addNode(element, node.left) : (node.left = createNode(element, node, "left"));
		else if (compareFn!(element, node.element) === 1)
			node.right ? addNode(element, node.right) : (node.right = createNode(element, node, "right"));
	};

	const deleteLeafNode = (element: T, parent: NodeType<T> | null) => {
		if (!parent) throw new Error("Root deletion not allowed.");
		parent.left?.element === element ? (parent.left = null) : (parent.right = null);
	};

	const deleteNodeWithOneChild = (node: NodeType<T>, parent: NodeType<T> | null) => {
		const replacerNode = node.left ? node.left : node.right;

		replacerNode!.level = node.level;
		recalcLevel(replacerNode!);

		if (!parent) root.element = replacerNode!.element;
		else {
			replacerNode!.parent = parent;
			parent.left?.element === node.element ? (parent.left = replacerNode) : (parent.right = replacerNode);
		}
	};

	const deleteNodeWithTwoChildren = (node: NodeType<T>, parent: NodeType<T> | null) => {
		const replacer = inOrderReplacer(node);
		if (!replacer) throw new Error("Node with two children without parent.");
		deleteNode(replacer.element);
		if (!parent) root.element = replacer.element;
		else parent.left === node ? (parent.left.element = replacer.element) : (parent.right!.element = replacer.element);
	};

	const deleteNode = (element: T, node: NodeType<T> | null = root): boolean => {
		if (!node) return false;
		if (element === root.element && isLeaf(root)) throw new Error("Root deletion not allowed.");

		if (node.element === element) {
			if (isLeaf(node)) deleteLeafNode(element, node.parent);
			else if (hasTwoChildren(node)) deleteNodeWithTwoChildren(node, node.parent);
			else deleteNodeWithOneChild(node, node.parent);
			return true;
		}
		if (compareFn!(element, node.element) === -1) return deleteNode(element, node.left);
		else if (compareFn!(element, node.element) === 1) return deleteNode(element, node.right);
		return false;
	};

	const searchNode = (value: T, node: NodeType<T> = root): NodeType<T> | false => {
		const comparison = compareFn!(value, node.element);
		if (comparison === 0) return node;
		if (comparison === -1 && node.left) return searchNode(value, node.left);
		if (comparison === 1 && node.right) return searchNode(value, node.right);
		return false;
	};

	const visit = (node: NodeType<T> | null = root, order: OrderType = "Inorder"): NodeType<T>[] => {
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
				const _exhaustiveCheck: never = order;
				throw new Error("Unknown order.");
		}
	};

	// Returns a Iterator, Generator is a specific Iterator
	// yield* transfere a chamada do next para outro generator, ou seja, o outro generator que deve atender o next e fazer o yield de algo
	// function* iterator(order: OrderType = "Inorder", node = root): Iterator<T> {
	function* visitIterator(order: OrderType = "Inorder", node = root): Generator<T, undefined, undefined> {
		if (order === "Preorder") yield node.element;
		if (node.left) yield* visitIterator(order, node.left); // cria um novo generator e chama o primeiro next nele.
		if (order === "Inorder") yield node.element;
		if (node.right) yield* visitIterator(order, node.right); // cria um novo generator e chama o primeiro next nele.
		if (order === "Postorder") yield node.element;
	}

	const map = (fn: MapFnType<T>, order: OrderType = "Inorder"): ReturnType<typeof fn>[] => {
		const recursiveMap = ([currentElement, ...rest]: T[], index = 0): ReturnType<typeof fn>[] => {
			if (!currentElement) return [];
			return [fn(currentElement, index), ...recursiveMap(rest, index + 1)];
		};

		return recursiveMap([...visitIterator(order)]);
	};

	const filter = (fn: FilterFnType<T>, order: OrderType = "Inorder"): T[] => {
		const recursiveFilter = ([currentElement, ...rest]: T[], index = 0): T[] => {
			if (!currentElement) return [];
			const fnResult = fn(currentElement, index) ? [currentElement] : [];
			return [...fnResult, ...recursiveFilter(rest, index + 1)];
		};

		return recursiveFilter([...visitIterator(order)]);
	};

	// testar reduce
	const reduce = (fn: ReduceFnType<T>, acc: any = undefined, order: OrderType = "Inorder"): ReturnType<typeof fn> => {
		const recursiveReduce = (array: T[], acc: any = undefined, index = 0): ReturnType<typeof fn> => {
			if (array.length === 0) return acc;
			if (acc === undefined) [acc, ...array] = array;
			return recursiveReduce(array.slice(1), fn(acc, array[0], index + 1), index + 1);
		};
		return recursiveReduce([...visitIterator(order)], fn, acc);
	};

	const forEach = (fn: ForEachFnType<T>): void => {
		for (let [index, element] of [...visitIterator()].entries()) fn(element, index);
	};

	const nodeForEach = (fn: NodeForEachFnType<T>, rootNode: NodeType<T> = root, order: OrderType = "Inorder"): void => {
		const orderedNodes = visit(rootNode, order);
		for (let [index, node] of orderedNodes.entries()) fn(node, index);
	};

	const nodeCount = (node: NodeType<T> = root, kind?: NodeKindType): number => {
		if (!kind) return visit(node).length;
		const kindCheckFn = kind === "Leaf" ? isLeaf : kind === "OneChild" ? hasOnlyOneChild : hasTwoChildren;
		let count = 0;
		nodeForEach(node => {
			if (kindCheckFn(node)) count++;
		});
		return count;
	};

	const sortNodesByLevel = () => {
		const orderedNodes = visit();

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

	const lowestCommonAncestor = (firstElement: T, secondElement: T, node: NodeType<T> | null = root): NodeType<T> | false => {
		// if (!node || !searchNode(firstElement) || !searchNode(secondElement)) return false;    // considering that the elements may not be in the tree

		if (!node) return false;

		const firstCmp = compareFn!(firstElement, node.element);
		const secondCmp = compareFn!(secondElement, node.element);

		if (firstCmp === 0 || secondCmp === 0) return node;
		else if (firstCmp === -1 && secondCmp === -1) return lowestCommonAncestor(firstElement, secondElement, node.left);
		else if (firstCmp === 1 && secondCmp === 1) return lowestCommonAncestor(firstElement, secondElement, node.right);
		else if ((firstCmp === 1 && secondCmp === -1) || (firstCmp === -1 && secondCmp === 1)) return node;
		else return false;
	};

	const add = (element: T) => addNode(element);
	const remove = (element: T) => deleteNode(element);
	const search = (element: T) => (searchNode(element) ? true : false);
	const traverse = (order: OrderType = "Inorder") => [...visitIterator(order)];
	const height = (rootNode: NodeType<T> = root) => nodeHeight(rootNode);
	const min = (node: NodeType<T> = root): T => leftMostElement(node);
	const max = (node: NodeType<T> = root): T => rightMostElement(node);

	return {
		// Iterable returns a Iterator
		[Symbol.iterator]: () => visitIterator(),
		root,
		add,
		traverse,
		search,
		remove,
		map,
		filter,
		forEach,
		reduce,
		min,
		max,
		inOrderReplacer,
		validate,
		height,
		createNode,
		ancestralReplacer,
		hasTwoChildren,
		isLeaf,
		hasOnlyOneChild,
		nodeHeight,
		visitIterator,
		displayTreeInline,
		displayTreePyramid,
		lowestCommonAncestor,
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

// tree.displayTreePyramid();

// tree.remove(2);
// tree.displayTreePyramid();
// tree.displayTreeInline();

// let a = tree.visitIterator();
// //console.log([...a]);
// console.log([...tree]);

// // // console.log(tree.validate(tree.root.right!));
// // tree.remove(10);
console.log(tree.traverse());
