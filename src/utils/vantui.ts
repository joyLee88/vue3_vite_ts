import { App } from "vue";
import { Button, Field } from "vant";
const Vant = {
  install: (app: App): void => {
    app.component(Button.name, Button);
    app.component(Field.name, Field);
  },
};
export default Vant;