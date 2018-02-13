from easy_dict import easy_dict



def test_easy_dict_introscpects_scope_of_caller():
	("calling easy_dict() with positional args "
	"should cause it to discover the names of "
	"the variables from the scope of the caller")
	a, b, self = 1, 2, 3
	my_data = easy_dict(a, b, self)

	my_data.should.equal({
		"a": 1,
		"b": 2,
		"self": 3,
	})


def test_easy_dict_respects_only_my_variables_from_within_method():
	("calling easy_dict() from within a method should exclude self")
	class Dummy:
		def get_vars(self):
			a, b, c = 1, 2, 3
			return easy_dict(a, b, c)

	d = Dummy()
	d.get_vars().should.equal({
		"a": 1,
		"b": 2,
		"c": 3,
	})