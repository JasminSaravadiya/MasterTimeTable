declare module '@dnd-kit/core' {
  export const DndContext: any;
  export const closestCenter: any;
  export const KeyboardSensor: any;
  export const PointerSensor: any;
  export function useSensor(...args: any[]): any;
  export function useSensors(...args: any[]): any;
  export function useDroppable(args: any): any;
}

declare module '@dnd-kit/sortable' {
  export const SortableContext: any;
  export const arrayMove: any;
  export const sortableKeyboardCoordinates: any;
  export const verticalListSortingStrategy: any;
  export function useSortable(args: any): any;
}

declare module '@dnd-kit/utilities' {
  export const CSS: any;
}
