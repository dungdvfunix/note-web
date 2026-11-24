// Static assets (the React SPA) are served by the assets layer.
// Only /api/* reaches this Worker; it is forwarded to the notes-api Worker
// through the service binding (the host is ignored by service bindings).
export default {
	fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname.startsWith("/api/")) {
			return env.API.fetch(new Request(`https://notes-api${url.pathname}${url.search}`, request));
		}
		return new Response("Not found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
