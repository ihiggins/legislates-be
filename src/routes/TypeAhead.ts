import { FastifyApp, Services } from "../types/common";
import { TypeAheadIRoute } from "../types/TypeAhead";
import { TypeAheadSchema } from "../schemas/GeneratedSchemas";
import { search } from "../services/Postgres";

export function TypeAheadRoutes(app: FastifyApp, { }: Services) {
    app.post<{
        Body: TypeAheadIRoute;
    }>(
        "/",
        {
            schema: {
                body: TypeAheadSchema,
            },
        },
        async (req, res) => {
            try {
                res.code(200);
                console.log(req.body);
                
                return res.send(await search(req.body.query));
            } catch {
                res.code(501);  
                res.send('error');
            }
        }
    );
}
