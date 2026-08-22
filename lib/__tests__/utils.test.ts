import { cn } from '../utils';

describe('cn', () => {
	it('returns an empty string when called with no arguments', () => {
		expect(cn()).toBe('');
	});

	it('joins simple class names with spaces', () => {
		expect(cn('flex', 'items-center', 'gap-2')).toBe('flex items-center gap-2');
	});

	it('ignores falsy values so conditional classes can be inlined', () => {
		expect(cn('base', false && 'hidden', null, undefined, 0, '', 'visible')).toBe(
			'base visible'
		);
	});

	it('flattens nested arrays of class names', () => {
		expect(cn(['px-2', ['py-1', 'rounded']])).toBe('px-2 py-1 rounded');
	});

	it('includes object keys whose values are truthy and drops the rest', () => {
		expect(cn({ flex: true, hidden: false, 'items-center': 1 })).toBe('flex items-center');
	});

	it('lets the later Tailwind utility win when two classes set the same property', () => {
		expect(cn('p-2', 'p-4')).toBe('p-4');
		expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
		expect(cn('px-2 py-1', 'px-8')).toBe('py-1 px-8');
	});
});
