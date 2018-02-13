import ast
import inspect 


def easy_dict(*args):
	frames = inspect.getouterframes(inspect.currentframe())
	caller_frame = frames[1][0]
	source_code = "".join(frames[1][-2])
	ast_module = ast.parse(source_code.strip())
	import ipdb;ipdb.set_trace()
	result = caller_frame.f_locals.copy()
	result.pop("self", None)
	return result
