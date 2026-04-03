local productFilter(product) = std.objectHas(product, "nutriments") && std.objectHas(product, "image_small_url");

[
	{
		"code": x.code,
		"nutriments": x.nutriments,
		"image_small_url": x.image_small_url
	} for x in std.filter(productFilter, payload.hits)
]