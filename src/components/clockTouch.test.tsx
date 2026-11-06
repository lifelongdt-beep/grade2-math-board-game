// @vitest-environment jsdom
import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ManipulateTask } from './Manipulate';

beforeAll(() => {
  vi.stubGlobal('PointerEvent', class extends MouseEvent {
    pointerId: number;
    constructor(type: string, init: PointerEventInit) { super(type,init); this.pointerId=init.pointerId??1; }
  });
  vi.stubGlobal('DOMPoint', class {
    constructor(public x: number,public y: number) {}
    matrixTransform() { return this; }
  });
  Object.defineProperty(SVGSVGElement.prototype,'getScreenCTM',{configurable:true,value:()=>({inverse:()=>({})})});
});
afterAll(() => { delete (SVGSVGElement.prototype as unknown as Record<string,unknown>).getScreenCTM; vi.unstubAllGlobals(); });
const position = (angle: number,r: number,pointerId=1) => ({clientX:130+r*Math.sin(angle*Math.PI/180),clientY:130-r*Math.cos(angle*Math.PI/180),pointerId});

it('손가락으로 대략 놓아도 4시 25분을 만들고 취소 뒤에는 움직이지 않습니다', () => {
  const submit=vi.fn();
  const m={kind:'clock',h:4,m:25,step:5} as const;
  const {container,rerender}=render(<ManipulateTask m={m} locked={false} reveal={false} onSubmit={submit}/>);
  const svg=container.querySelector('svg')!;
  fireEvent.pointerDown(svg,position(118,40));
  fireEvent.pointerUp(svg,position(118,40));
  fireEvent.pointerDown(svg,position(148,90));
  fireEvent.pointerMove(svg,position(165.5,90)); // 눈금 경계에서 손이 떨려도 25분 유지
  fireEvent.pointerMove(svg,position(270,90,2)); // 다른 손가락의 간섭 무시
  fireEvent.pointerCancel(svg,position(165.5,90));
  fireEvent.pointerMove(svg,position(270,90));
  fireEvent.click(screen.getByRole('button',{name:'확인'}));
  expect(submit.mock.calls[0][0].ok).toBe(true);
  rerender(<ManipulateTask m={m} locked={true} reveal={false} onSubmit={submit}/>);
  const before=svg.innerHTML;
  fireEvent.pointerDown(svg,position(270,90));
  fireEvent.pointerMove(svg,position(180,90));
  expect(svg.innerHTML).toBe(before);
  cleanup();
});
