const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

exports.success = (data, statusCode = 200) => ({// template pag send sa user success error
    statusCode,
    headers,
    body: JSON.stringify({success: true, data}),
});

exports.error = (message, statusCode = 500) => ({
    statusCode,
    headers,
    body: JSON.stringify({success: false, error:{message}}),
});