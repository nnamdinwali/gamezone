"use strict";
export default `import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="text-9xl font-heading font-bold text-muted/20 absolute -z-10">404</div>
      <h1 className="text-4xl font-heading font-bold uppercase">Game Over</h1>
      <p className="text-muted-foreground max-w-md">
        The page you're looking for has been moved, deleted, or never existed in this dimension.
      </p>
      <Link href="/">
        <Button size="lg" className="mt-4">
          Return to Base
        </Button>
      </Link>
    </div>
  );
}
`;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IjtBQUFBLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSIsIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsibm90LWZvdW5kLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcImltcG9ydCB7IExpbmsgfSBmcm9tIFxcXCJ3b3V0ZXJcXFwiO1xcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gXFxcIkAvY29tcG9uZW50cy91aS9idXR0b25cXFwiO1xcblxcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE5vdEZvdW5kKCkge1xcbiAgcmV0dXJuIChcXG4gICAgPGRpdiBjbGFzc05hbWU9XFxcImZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIG1pbi1oLVs2MHZoXSB0ZXh0LWNlbnRlciBzcGFjZS15LTZcXFwiPlxcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJ0ZXh0LTl4bCBmb250LWhlYWRpbmcgZm9udC1ib2xkIHRleHQtbXV0ZWQvMjAgYWJzb2x1dGUgLXotMTBcXFwiPjQwNDwvZGl2PlxcbiAgICAgIDxoMSBjbGFzc05hbWU9XFxcInRleHQtNHhsIGZvbnQtaGVhZGluZyBmb250LWJvbGQgdXBwZXJjYXNlXFxcIj5HYW1lIE92ZXI8L2gxPlxcbiAgICAgIDxwIGNsYXNzTmFtZT1cXFwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1heC13LW1kXFxcIj5cXG4gICAgICAgIFRoZSBwYWdlIHlvdSdyZSBsb29raW5nIGZvciBoYXMgYmVlbiBtb3ZlZCwgZGVsZXRlZCwgb3IgbmV2ZXIgZXhpc3RlZCBpbiB0aGlzIGRpbWVuc2lvbi5cXG4gICAgICA8L3A+XFxuICAgICAgPExpbmsgaHJlZj1cXFwiL1xcXCI+XFxuICAgICAgICA8QnV0dG9uIHNpemU9XFxcImxnXFxcIiBjbGFzc05hbWU9XFxcIm10LTRcXFwiPlxcbiAgICAgICAgICBSZXR1cm4gdG8gQmFzZVxcbiAgICAgICAgPC9CdXR0b24+XFxuICAgICAgPC9MaW5rPlxcbiAgICA8L2Rpdj5cXG4gICk7XFxufVxcblwiIl0sImZpbGUiOiIvaG9tZS9ydW5uZXIvd29ya3NwYWNlL2FydGlmYWN0cy9nYW1lem9uZS9zcmMvcGFnZXMvbm90LWZvdW5kLnRzeCJ9