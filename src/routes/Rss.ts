import { FastifyApp, Services } from "../types/common";
import { getMessages } from "../services/Postgres";
import { RssIRoute } from "../types/Rss";
import { RssSchema } from "../schemas/GeneratedSchemas";



export function RssRoutes(app: FastifyApp, { }: Services) {
    let rssId = ['president', 'house', 'senate', 'commons', 'lords']

    app.get<{
        Querystring: RssIRoute
    }>(
        "/:topic",
        { schema: { querystring: RssSchema } },
        async (req, res) => {
            //@ts-ignore
            return res.send(await getMessages(rssId.indexOf(req.params.topic) + 1));
        }
    );
}



// export function RssRoutes(app: FastifyApp, { }: Services) {


//     app.get(
//         "/president",
//         async (req, res) => {
//             try {
//                 res.code(200);
//                 return res.send(await getMessages(1));
//             } catch {
//                 res.code(501);
//                 res.send('error');
//             }
//         }
//     );
// }
