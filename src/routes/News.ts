import { FastifyApp, Services } from "../types/common";
import { queryTopic } from "../services/News";
import { NewsIRoute } from "../types/News";
import { NewsSchema } from "../schemas/GeneratedSchemas";

export function NewsRoutes(app: FastifyApp, { }: Services) {
    app.get<{
        Querystring: NewsIRoute
    }>(
        "/:topic",
        { schema: { querystring: NewsSchema } },
        async (req, res) => {
            //@ts-ignore
            return res.send(await queryTopic(req.params.topic));
        }
    );
}
