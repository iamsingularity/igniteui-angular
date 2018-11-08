# IgxToggle Directive

The **IgxToggle** provides a way for user to make a given content togglable.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toggle.html)

#Usage
```typescript
import { IgxToggleModule } from "igniteui-angular";
```

Basic initialization
```html
<div igxToggle>
    <p>Some content that user would like to make it togglable.</p>
</div>
```

Opne/Close toggle through public methods that are provided by exporting the directive with name **toggle**.
```html
<button (click)="toggleRef.open()">Open</button>
<button (click)="toggleRef.close()">Close</button>
<div igxToggle #toggleRef="toggle">
    <p>Some content that user would like to make it togglable.</p>
</div>
```

Open/Close the directive only through one trigger by exporting it with name **toggle** and subscription for event
handlers when the toggle is opened and respectively closed. 
```html
<button (click)="toggleRef.toggle()">Toggle</button>
<div igxToggle #toggleRef="toggle" (onOpening)="eventHandler()" (onOpened)="eventHandler()" (onClosing)="eventHandler()" (onClosed)="eventHandler()">
    <p>Some content that user would like to make it togglable.</p>
</div>
```

## API Summary

### Outputs
| Name | Return Type | Description |
|:--:|:---|:---|
| `onOpening` | `void` | Emits an event before the toggle container is opened. |
| `onOpened` | `void` | Emits an event after the toggle container is opened. |
| `onClosing` | `void` | Emits an event before the toggle container is closed. |
| `onClosed` | `void` | Emits an event after the toggle container is closed. |
### Methods
| Name   | Arguments | Return Type | Description |
|:----------:|:------|:------|:------|
| `open` | overlaySettings?: `OverlaySettings` | `void` | Opens the toggle. |
| `close` | --- | `void` | Closes the toggle. |
| `toggle` | overlaySettings?: `OverlaySettings` | `void` | Closes the toggle. |
| `reposition` | --- | `void` | Repositions the toggle. |


# IgxToggleAction Directive

The **IgxToggleAction** provides a way for user to Open/Close(toggle) every Component/Directive which implements **IToggleView** interface by providing the reference to this particular Component/Directive or ID which is registered into **IgxNavigationService**. It is also applicable upon **IgxToggle**

You can see it in action [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toggle.html)

## Usage
```typescript
import { IgxToggleModule } from "igniteui-angular";
```

Basic initialization
```html

<button [igxToggleAction]="toggleRef">Toggle</button>
<div igxToggle #toggleRef="toggle">
    <p>Some content that user would like to make it togglable.</p>
</div>
```

Passing registered component into **IgxNavigationService** by ID.
```html
<button igxToggleAction="toggle">Toggle</button>
<div igxToggle id="toggle">
    <p>Some content that user would like to make it togglable.</p>
</div>
```

Providing reference from custom component which has already implemented **IToggleView** interface.
```html
<button [igxToggleAction]="reference">Toggle</button>
<custom-component #reference></custom-component>
```

Providing reference from custom component which has already been registered into **IgxNavigationService**.
```html
<button igxToggleAction="customComponent">Toggle</button>
<custom-component id="customComponent"></custom-component>
```

## API Summary

### Inputs
| Name       |      Type      |  Description |
|:----------:|:-------------|:------|
| `igxToggleAction`| `IToggleView` \| `string` | Determines the target that have to be controled. |
| `overlaySettings` | `OverlaySettings`| Passes `igxOverlay` settings for applicable targets (`igxToggle`) that control positioning, interaction and scroll behavior.
| `igxToggleOutlet` | `IgxOverlayOutletDirective` \| `ElementRef`| Determines where the target overlay element should be attached. Shortcut for `overlaySettings.outlet`.
| `closeOnOutsideClick`| `Boolean` | **Deprecated.** Determines if passed Component/Directive have to be closed when it is clicked outside. |

# IgxOverlayOutlet Directive

The **IgxOverlayOutlet** provides a way to mark an element as an `igxOverlay` outlet container through the component template only.
Directive instance is exported as `overlay-outlet`, so it can be assigned within the template:

```html
<div igxOverlayOutlet #outlet="overlay-outlet"></div>
```
This allows to provide the `outlet` templates variable as a setting to the toggle action:
```html
<button [igxToggleAction]="reference" [igxToggleOutlet]="outlet">Toggle</button>
<custom-component #reference></custom-component>
```