// print
// encontrar a maior arvore balanceada 'dentro' da arvore
// using cached inOrderTraverse result
// FAZER TESTES DE TUDO
//  o p5.js
// arrumar map, filter e reduce

// -----------------------------------------------OBS------------------------------------------------------------------
// coisas que querem iterar pelos nodes utilizam o visit e os que querem iterar pelos elements utilizam o iterator
// nada impediria de ter 2 iterators, um que retornasse nodes array e outro que retornasse elements array
// --------------------------------------------------------------------------------------------------------------------

// https://www.freecodecamp.org/news/binary-search-tree-traversal-inorder-preorder-post-order-for-bst/
// assertion typescript ? --> console.assertion ou criar própria fn: https://stackoverflow.com/questions/15313418/what-is-assert-in-javascript

type NodeType<T extends {}> = {
	element: T;
	left: NodeType<T> | null;
	right: NodeType<T> | null;
	parent: NodeType<T> | null;
};

type CompareFnReturnType = -1 | 0 | 1;
type CompareFnType<T extends {}> = (leftElement: T, rightElement: T) => CompareFnReturnType;

type OrderType = "Inorder" | "Preorder" | "Postorder";
type NodeKindType = "Leaf" | "OneChild" | "TwoChildren";
type NodeKindFn<T extends {}> = (node: NodeType<T>) => boolean;

type MapFnType<T> = (element: T, index?: number) => any;
type FilterFnType<T> = (element: T, index?: number) => boolean;
type ForEachFnType<T> = (element: T, index?: number) => void;
type NodeForEachFnType<T extends {}> = (node: NodeType<T>, index?: number) => void;
type ReduceFnType<T> = (acc: any, element: T, index?: number) => any;

// {} allows all types except undefined and null
const binaryTree = <T extends {}>(rootElement: T, compareFn?: CompareFnType<T>) => {
	if ((typeof rootElement === "object" && !compareFn) || typeof rootElement === "function")
		throw new Error("Unable to sort tree.");

	const createNode = (element: T, parent: NodeType<T> | null = null): NodeType<T> => {
		return { element, left: null, right: null, parent };
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

	const rightMostElement = (node: NodeType<T> = root): T => {
		if (isLeaf(node) || !node.right) return node.element;
		return rightMostElement(node.right);
	};

	const leftMostElement = (node: NodeType<T> = root): T => {
		if (isLeaf(node) || !node.left) return node.element;
		return leftMostElement(node.left);
	};

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

	const addNode = (element: T, node: NodeType<T> = root) => {
		if (element === node.element) return;
		if (compareFn!(element, node.element) === -1)
			node.left ? addNode(element, node.left) : (node.left = createNode(element, node));
		else if (compareFn!(element, node.element) === 1)
			node.right ? addNode(element, node.right) : (node.right = createNode(element, node));
	};

	const deleteLeafNode = (element: T, parent: NodeType<T> | null) => {
		if (!parent) throw new Error("Root deletion not allowed.");
		parent.left?.element === element ? (parent.left = null) : (parent.right = null);
	};

	const deleteNodeWithOneChild = (node: NodeType<T>, parent: NodeType<T> | null) => {
		const replacerNode = node.left ? node.left : node.right;
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
		if (element === root.element && isLeaf(root)) throw new Error("Root deletion not allowed.");
		if (!node) return false;

		if (node.element === element) {
			if (!node.parent && node !== root) throw new Error(`Can not delete node with no parent.`);
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

	const forEach = (fn: ForEachFnType<T>, order: OrderType = "Inorder"): void => {
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
	};
};

export { binaryTree };

const tree = binaryTree(10);
tree.add(5);
tree.add(1);
tree.add(7);
tree.add(6);
tree.add(8);
tree.add(9);
tree.add(15);
tree.add(13);
tree.add(12);
tree.add(11);
tree.add(17);

let a = tree.visitIterator();
//console.log([...a]);
console.log([...tree]);

// // console.log(tree.validate(tree.root.right!));
// tree.remove(10);
console.log(tree.traverse());
