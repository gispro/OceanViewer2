//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
exports.app = function(request)
{
	var content;
	if (request.params.service === "user")
	{
		content = {user: "gispro"};
		content = JSON.stringify(content);
	}
	var resp = 
	{
		status: 200,
		headers: {
			"Content-Type": "application/json"
		},
		body: [content]
	};
    return resp;    
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
