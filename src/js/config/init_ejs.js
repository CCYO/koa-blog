//  因為 HtmlWebpackPlugin 會將 example.bound.js 自動插入 exampl.html 中
//  而 example.bound.js 裡通常會需要用到 example.html 內的 el，
//  所以 example.bound.js 與 example.html 會有相同的「標示」，
//  如 selector 或 data-set 等，為了開發方便，故將其統一蒐集起來

//  PAGE 僅前端會用到
//  SERVER 後端
import { PAGE, SERVER } from "~/build/init_ejs";

export default { PAGE, SERVER };
export { PAGE, SERVER };
