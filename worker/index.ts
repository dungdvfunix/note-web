export default {
	fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname.startsWith("/api/")) {
			return env.API.fetch(new Request(`https://notes-api${url.pathname}${url.search}`, request));
		}
		return new Response("Not found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
