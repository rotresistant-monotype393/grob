# Call Frames

## The Call Frame

When a function is called the VM pushes a call frame onto a fixed array:

```csharp
struct CallFrame
{
    public GrobFunction Function;
    public int InstructionPointer;
    public int StackBase;
}
```

```csharp
CallFrame[] _frames = new CallFrame[256];
int _frameCount = 0;
```

No heap allocation per call. The frame stores which function is executing, where
in its bytecode we are and where its local variables start on the stack.

## Local Variables as Stack Slots

Local variables live directly on the value stack — array indexing, not dictionary
lookup.

```
// fn add(a: int, b: int): int
// Stack after call with add(3, 4):
... | 3 | 4 | _ |
      ↑   ↑   ↑
    slot0 slot1 slot2
    (a)   (b)   (result)
```

Arguments pushed by the caller become the first locals automatically.

```csharp
case OpCode.GetLocal:
    int slot = ReadByte();
    Push(_stack[frame.StackBase + slot]);
    break;
```

## Calling

```csharp
case OpCode.Call:
    int argCount = ReadByte();
    var function = Peek(argCount) as GrobFunction;
    _frames[_frameCount++] = new CallFrame
    {
        Function = function,
        InstructionPointer = 0,
        StackBase = _stackTop - argCount
    };
    break;
```

## Returning

```csharp
case OpCode.Return:
    var result = Pop();
    _frameCount--;
    _stackTop = frame.StackBase - 1;
    Push(result);
    break;
```

## Stack Overflow

```csharp
if (_frameCount == MaxFrames)
{
    RuntimeError("Stack overflow — maximum call depth exceeded");
    return;
}
```

Maximum call depth is 256 frames. This is sufficient for scripting use cases
and catches accidental infinite recursion early.

## Stack Traces

A stack trace is the frames array printed from top to bottom. Each line is one
`CallFrame` — the function name and instruction pointer. Debug builds include a
name table mapping slot numbers to variable names. Release builds strip it.

See also: [Overview](Overview.md), [Instruction Set](Instruction-Set.md)
